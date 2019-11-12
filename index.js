var request = require('request');

const chalk  = require('chalk');

var urlRoot = "https://api.github.ncsu.edu";

//	Github Standard Endpoint
//var urlRoot = "https://api.github.com";
// 	NCSU Enterprise endpoint:
//var urlRoot = "https://api.github.ncsu.edu";

var config = {};
// Retrieve our api token from the environment variables.
config.token = process.env.GITHUBTOKEN;

if( !config.token )
{
	console.log(chalk`{red.bold GITHUBTOKEN is not defined!}`);
	console.log(`Please set your environment variables with appropriate token.`);
	console.log(chalk`{italic You may need to refresh your shell in order for your changes to take place.}`);
	process.exit(1);
}

console.log(chalk.green(`Your token is: ${config.token.substring(0,4)}...`));


if (process.env.NODE_ENV != 'test')
{
	(async () => {
		await listAuthenicatedUserRepos();
		await listBranches("pppandi2", "HW1-510");
		await createRepo("pppandi2","Test-Repo");
		await createIssue("pppandi2", "HW1-510", "Issue created using REST Api", "This issue was created using REST Api for the purpose of learning.");
		await enableWikiSupport("pppandi2", "Test-Repo");

	})()
}

function getDefaultOptions(endpoint, method)
{
	var options = {
		url: urlRoot + endpoint,
		method: method,
		headers: {
			"User-Agent": "CSC510-REST-WORKSHOP",
			"content-type": "application/json",
			"Authorization": `token ${config.token}`
		}
	};
	return options;
}

async function getUser()
{
	let options = getDefaultOptions("/user", "GET");

	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {

			resolve( JSON.parse(body).login );
		});
	});
}

function listAuthenicatedUserRepos()
{
	let options = getDefaultOptions("/user/repos?visibility=all", "GET");

	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body)
		{
			if( error )
			{
				console.log( chalk.red( error ));
				reject(error);
				return; // Terminate execution.
			}

			var obj = JSON.parse(body);
			// console.log(JSON.stringify(body));
			console.log('Authenticated user repositories:');
			for( var i = 0; i < obj.length; i++ )
			{
				var name = obj[i].name;
				console.log( name );
			}
			console.log();
			// Return object for people calling our method.
			resolve(obj);
		});
	});

}

// 1. Write code for listBranches in a given repo under an owner. See list branches
async function listBranches(owner,repo)
{
	let options = getDefaultOptions(`/repos/`+owner+`/`+repo+`/branches`, "GET");
	// console.log(options);
	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {

			if (error) {
				console.log(chalk.red(error));
				reject(error);
				return; // Terminate execution.
			}
			var obj = JSON.parse(body);
			console.log('Branches belonging to the '+repo+' repository:');
			for (var i = 0; i < obj.length; i++) {
				var name = obj[i].name;
				console.log(name);
			}
			console.log();
			resolve(obj);

		});
	});
}

// 2. Write code to create a new repo
async function createRepo(owner,repo)
{
	let options = getDefaultOptions("/user/repos", "POST");
	options.body = JSON.stringify({
		name: repo,
		description:'This repo was created using REST Api'
	})
	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {
			if (error) {
				console.log(chalk.red(error));
				reject(error);
				return; // Terminate execution.
			}

			resolve( response.statusCode );

		});
	});

}

// 3. Write code for creating an issue for an existing repo.
async function createIssue(owner, repo, issueName, issueBody)
{
	let options = getDefaultOptions("/repos/"+owner+"/"+repo+"/issues", "POST");
	
	var details = {
		title:issueName,
		body:issueBody
	}

	options.body = JSON.stringify(details);
	// console.log(options)
	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {
			if (error) {
				console.log(chalk.red(error));
				reject(error);
				return; // Terminate execution.
			}
			// if(response.statusCode==201){console.log('successful!')}
			resolve( response.statusCode );

		});
	});
}

// 4. Write code for editing a repo to enable wiki support.
async function enableWikiSupport(owner, repo)
{
	let options = getDefaultOptions("/repos/"+owner+"/"+repo, "PATCH");

	options.body = JSON.stringify({
		has_wiki:true
	})

	// console.log(options)

	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {
			if (error) {
				console.log(chalk.red(error));
				reject(error);
				return; // Terminate execution.
			}
			console.log(JSON.parse(body));
			resolve( JSON.parse(body) );
		});
	});
}

module.exports.getUser = getUser;
module.exports.listAuthenicatedUserRepos = listAuthenicatedUserRepos;
module.exports.listBranches = listBranches;
module.exports.createRepo = createRepo;
module.exports.createIssue = createIssue;
module.exports.enableWikiSupport = enableWikiSupport;
