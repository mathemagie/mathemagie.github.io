<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\JsonFormatter;

function createLogger(string $name): Logger
{
    $logger = new Logger($name);

    $fileHandler = new RotatingFileHandler(
        filename: __DIR__ . '/logs/rss_parser.log',
        maxFiles: 7,
        level: Logger::DEBUG,
    );
    $fileHandler->setFormatter(new JsonFormatter());
    $logger->pushHandler($fileHandler);

    $logger->pushHandler(new StreamHandler('php://stderr', Logger::WARNING));

    return $logger;
}

final class RssItem
{
    public function __construct(
        public readonly string $title,
        public readonly string $link,
        public readonly string $description,
        public readonly string $pubDate,
        public readonly string $comments,
    ) {}
}

final class RssFeed
{
    /** @param list<RssItem> $items */
    public function __construct(
        public readonly string $title,
        public readonly string $link,
        public readonly string $description,
        public readonly array $items,
    ) {}
}

function fetchRssFeed(string $url, Logger $log): RssFeed
{
    $log->info('Fetching RSS feed', ['url' => $url]);

    $xml = @simplexml_load_file($url);

    if ($xml === false) {
        $log->error('Failed to fetch or parse RSS feed', ['url' => $url]);
        throw new RuntimeException("Failed to fetch or parse RSS feed from: {$url}");
    }

    $channel = $xml->channel;
    $items = [];

    foreach ($channel->item as $entry) {
        $items[] = new RssItem(
            title: (string) $entry->title,
            link: (string) $entry->link,
            description: strip_tags((string) $entry->description),
            pubDate: (string) $entry->pubDate,
            comments: (string) $entry->comments,
        );
    }

    $log->info('Parsed RSS feed', [
        'title' => (string) $channel->title,
        'item_count' => count($items),
    ]);

    return new RssFeed(
        title: (string) $channel->title,
        link: (string) $channel->link,
        description: (string) $channel->description,
        items: $items,
    );
}

function displayFeed(RssFeed $feed): void
{
    echo "=== {$feed->title} ===\n";
    echo "{$feed->description}\n\n";

    foreach ($feed->items as $i => $item) {
        $num = $i + 1;
        echo "{$num}. {$item->title}\n";
        echo "   Link: {$item->link}\n";
        if ($item->comments !== '') {
            echo "   Comments: {$item->comments}\n";
        }
        if ($item->pubDate !== '') {
            echo "   Published: {$item->pubDate}\n";
        }
        echo "\n";
    }

    echo "Total: " . count($feed->items) . " items\n";
}

// --- Main ---
$log = createLogger('rss-parser');
$url = 'https://news.ycombinator.com/rss';

try {
    $feed = fetchRssFeed($url, $log);
    displayFeed($feed);
    $log->info('Display complete', ['total_items' => count($feed->items)]);
} catch (RuntimeException $e) {
    $log->error('Script failed', ['error' => $e->getMessage()]);
    fwrite(STDERR, "Error: {$e->getMessage()}\n");
    exit(1);
}
