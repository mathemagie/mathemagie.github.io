<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Penelope gate</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
	<style>
		h3, h1 { color : white;}
		body {
		    background-image: url(./bg.jpg);
		    background-position: center center;
		    background-repeat: no-repeat;
		    background-attachment:fixed;
		    background-size: cover;
		    background-color: #464646;
		}
	</style>
  </head>
  <body>
      <div class="container theme-showcase" role="main">
        <h1>Penelope gate</h1>
    		<textarea name="resume" cols="70" rows="8" onkeyup="CalValeur(this);" onchange="CalValeur(this);"><?php echo $resume; ?></textarea><br /></p>
			<div class="hero container">
				<h3>
					<span id="nbcar">0</span> x Tarif Horaire de Penelope soit 28.57 Euros = <span id="total">0</span> Euros
				</h3>
			</div><br/><br/>
			<p><a id="mailto" target='_blank' class="btn btn-primary btn-lg" href="#" role="button">Envoie ta facture par email aux Républicains</a></p>
	    </div> <!-- /container -->
    <!-- Include all compiled plugins (below), or include individual files as needed -->
	 <script type="text/javascript">
	  function CalValeur(bloc) {
	  	document.getElementById('nbcar').innerHTML = bloc.value.length;
	  	var tx = 28.57;
	  	document.getElementById('total').innerHTML = bloc.value.length * tx;
		var  ebody = "Madame, Monsieur, j\'ai le plaisir de vous transmettre ma facture pour les " + bloc.value.length + "signes que j\'ai écrit aujourd'hui et qui selon le tarif Pénélope Fillon correspondent au montant suivant : " +  bloc.value.length * tx + ". Veuillez agréer, ou pas.";
		var mailto = 'mailto:sgir.lesrepublicains@assemblee-nationale.fr?subject=Transmission de facture  au tarif Pénélope Fillon&body=' + ebody;
		document.getElementById("mailto").href= mailto; 
	  }
	  </script>
  </body>
</html>