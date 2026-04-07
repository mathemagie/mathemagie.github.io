# PHP Debug Settings for Development

## Error Reporting

Show all errors immediately instead of failing silently.

```ini
error_reporting = E_ALL
display_errors = On
display_startup_errors = On
log_errors = On
error_log = /tmp/php_errors.log
```

## Strict Types

Add at the top of every PHP file:

```php
declare(strict_types=1);
```

Forces `TypeError` on type mismatches instead of silent coercion.

Without strict types:
```php
function add(int $a, int $b): int { return $a + $b; }
add("hello", 4); // returns 4, no error
```

With strict types:
```php
declare(strict_types=1);
add("hello", 4); // TypeError thrown immediately
```

## Assertions

Catch logic bugs at runtime.

```ini
zend.assertions = 1
assert.exception = On
```

Usage:
```php
assert($items !== [], 'RSS feed returned no items');
```

## Xdebug

Step-through debugging with breakpoints.

### Install

```bash
pecl install xdebug
```

### Configure in php.ini

```ini
zend_extension=xdebug
xdebug.mode = debug,develop,trace
xdebug.start_with_request = yes
xdebug.client_host = 127.0.0.1
xdebug.client_port = 9003
xdebug.log = /tmp/xdebug.log
```

## Memory and Time Limits

Give yourself room when debugging.

```ini
memory_limit = 512M
max_execution_time = 300
```

## Dev vs Prod Settings

| Setting | Dev | Prod |
|---|---|---|
| `display_errors` | On | Off |
| `error_reporting` | E_ALL | E_ALL |
| `log_errors` | On | On |
| `xdebug` | Enabled | Disabled |
| `zend.assertions` | 1 | -1 |

## PHPUnit for Unit Testing

### Install

```bash
composer require --dev phpunit/phpunit
```

### Configure phpunit.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    bootstrap="vendor/autoload.php"
    colors="true"
    stopOnFailure="true"
    verbose="true"
    displayDetailsOnTestsThatTriggerDeprecations="true"
    displayDetailsOnTestsThatTriggerWarnings="true"
    displayDetailsOnTestsThatTriggerErrors="true"
>
    <testsuites>
        <testsuite name="unit">
            <directory>tests</directory>
        </testsuite>
    </testsuites>

    <!-- Code coverage report -->
    <coverage>
        <include>
            <directory suffix=".php">src</directory>
        </include>
        <report>
            <html outputDirectory="coverage-report"/>
            <text outputFile="php://stdout"/>
        </report>
    </coverage>

    <!-- Logging for agent debugging -->
    <logging>
        <junit outputFile="test-results/junit.xml"/>
        <testdoxText outputFile="test-results/testdox.txt"/>
    </logging>
</phpunit>
```

### Example Test

```php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class RssItemTest extends TestCase
{
    public function testRssItemCreation(): void
    {
        $item = new RssItem(
            title: 'Test Title',
            link: 'https://example.com',
            description: 'A description',
            pubDate: '2026-04-06',
            comments: 'https://example.com/comments',
        );

        $this->assertSame('Test Title', $item->title);
        $this->assertSame('https://example.com', $item->link);
    }

    public function testRssItemRejectsWrongTypes(): void
    {
        $this->expectException(\TypeError::class);
        new RssItem(
            title: 123,  // wrong type — strict_types catches this
            link: 'https://example.com',
            description: '',
            pubDate: '',
            comments: '',
        );
    }
}
```

### Run Tests

```bash
# Run all tests
./vendor/bin/phpunit

# Run with coverage
XDEBUG_MODE=coverage ./vendor/bin/phpunit --coverage-html coverage-report

# Run a single test file
./vendor/bin/phpunit tests/RssItemTest.php

# Run with verbose output (useful for agent logs)
./vendor/bin/phpunit --testdox --verbose
```

## Structured Logging for Agent Debugging

### php.ini Access and Error Logs

```ini
; Separate error log per project
error_log = /tmp/php_agent_debug.log

; Access log (built-in server)
; Start with:
; php -S localhost:8000 -t public 2>&1 | tee /tmp/php_access.log
```

### Monolog for Structured Logs

```bash
composer require monolog/monolog
```

```php
declare(strict_types=1);

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\RotatingFileHandler;
use Monolog\Formatter\JsonFormatter;

function createLogger(string $name): Logger
{
    $logger = new Logger($name);

    // JSON formatted logs — easy to parse by agents
    $handler = new RotatingFileHandler(
        filename: '/tmp/agent_debug.log',
        maxFiles: 7,
        level: Logger::DEBUG,
    );
    $handler->setFormatter(new JsonFormatter());
    $logger->pushHandler($handler);

    // Also output to stderr for real-time monitoring
    $logger->pushHandler(new StreamHandler('php://stderr', Logger::WARNING));

    return $logger;
}

// Usage
$log = createLogger('rss-parser');
$log->info('Fetching RSS feed', ['url' => $url]);
$log->debug('Parsed items', ['count' => count($items)]);
$log->error('Feed fetch failed', ['url' => $url, 'error' => $e->getMessage()]);
```

### Log Output (JSON — agent-readable)

```json
{"message":"Fetching RSS feed","context":{"url":"https://news.ycombinator.com/rss"},"level":200,"level_name":"INFO","datetime":"2026-04-06T10:00:00+00:00"}
{"message":"Parsed items","context":{"count":30},"level":100,"level_name":"DEBUG","datetime":"2026-04-06T10:00:01+00:00"}
```

### Tail Logs in Real Time

```bash
# Watch error log
tail -f /tmp/php_agent_debug.log

# Watch JSON logs with pretty print
tail -f /tmp/agent_debug.log | jq .

# Filter only errors
tail -f /tmp/agent_debug.log | jq 'select(.level >= 400)'
```

### PHPUnit + Logging Together

In `phpunit.xml`, add an env variable so tests use a separate log file:

```xml
<php>
    <env name="LOG_FILE" value="/tmp/php_test_debug.log"/>
    <env name="LOG_LEVEL" value="DEBUG"/>
</php>
```

Then in test setup:

```php
protected function setUp(): void
{
    $this->logger = createLogger('test');
    $this->logger->info('Starting test', ['test' => $this->name()]);
}
```

## Find Your php.ini

```bash
php --ini
```

## Quick Verification

```bash
php -r "phpinfo();" | grep -E "error_reporting|display_errors|xdebug"
```
