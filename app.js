var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var dotenv = require('dotenv');
require('dotenv').config();
var secrets = require('./config/secrets');


const username = secrets.team.username;
const endPoint = `https://api.distelli.com/${username}`;

var app = express();
var port = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', function(req, res, callback) {
  var query = req.body.text;
  var username = req.body.user_name;
  var slackToken = req.body.token;
  var slackTeamId = req.body.team_id;
  processQuery(slackToken, slackTeamId, query, username, function(returnData) {
    res.send(returnData);
  })
});

function processQuery(slackToken, slackTeamId, query, username, callback) {
  query = query.toLowerCase();
  if (slackToken == secrets.team.slackToken && slackTeamId == secrets.team.slackTeam) {

    // List apps
    if (query == 'list apps') {
      request(`${endPoint}/apps?apiToken=${secrets.users[username]}&max_results=50`, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var returnData = [];
          var contents = JSON.parse(body);
          for (var i = 0; i < contents.apps.length; i++) {
            returnData.push(`<${contents.apps[i].html_url}|${contents.apps[i].name}>`);
          }
          returnData = `Here are your apps ${username}:\n${returnData.join('\n')}`;
          callback(returnData);
        } else {
          returnData = `Uh-oh, looks like something went wrong ${username}!`;
          callback(returnData);
        }
      })
    }

    // List builds
    else if (query == 'list builds') {
      request(`${endPoint}/builds?apiToken=${secrets.users[username]}&max_results=50&order=desc`,
        function(error, response, body) {
          console.log(error);
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i = 0; i < contents.builds.length; i++) {
              returnData.push(`<${contents.builds[i].html_url}|${contents.builds[i].commit.msg}>
                by${contents.builds[i].commit.committer} (${contents.builds[i].status}`);
            }
            returnData = `Here are your builds ${username}:\n${returnData.join('\n')}`;
            callback(returnData);
          } else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
      })
    }

    // List servers
    else if (query == 'list servers') {
      request(`${endPoint}/servers?apiToken=${secrets.users[username]}&max_results=50`,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i = 0; i < contents.servers.length; i++) {
              returnData.push(`<${contents.servers[i].html_url}|${contents.servers[i].dns_name}>`);
            }
            returnData = `Here are your servers ${username}:\n${returnData.join('\n')}`;
            callback(returnData);
          } else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
      })
    }

    // List envs
    else if (query == 'list envs') {
       request(`${endPoint}/envs?apiToken=${secrets.users[username]}&max_results=25`, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i =0; i < contents.envs.length; i++){
              returnData.push(`${contents.envs[i].app_name} / <${contents.envs[i].html_url}|${contents.envs[i].name}>`);
            }
            returnData = `Here are your envs ${username}:\n${returnData.join('\n')}`;
            callback(returnData);
          } else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
        })
     }

    // List envs for app [appName]
    else if (query.substring(0, 17) == 'list envs for app') {
      var queryArray = query.split(' ');
      var appName = queryArray[4];
       request(`${endPoint}/apps/${appName}/envs?apiToken=${secrets.users[username]}&max_results=25`,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i =0; i < contents.envs.length; i++) {
              returnData.push(`${contents.envs[i].app_name}  / <${contents.envs[i].html_url}|${contents.envs[i].name}>`);
            }
            returnData = `Here are your envs for app ${appName} ${username}:\n${returnData.join('\n')}`;
            callback(returnData);
          } else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
      })
    }

    // List servers for env [envName]
    else if (query.substring(0, 20) == 'list servers for env') {
      var queryArray = query.split(' ');
      var envName = queryArray[4];
       request(`${endPoint}/envs/${envName}/servers?apiToken=${secrets.users[username]}&max_results=25`,
        function(error, response, body) {
          if (!error && response.statusCode == 200){
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i =0; i < contents.servers.length; i++){
              returnData.push(`<${contents.servers[i].html_url}|${contents.servers[i].dns_name}>`);
            }
            returnData = `Here are the servers associate with env ${envName} ${username}:\n${returnData.join('\n')}`;
            callback(returnData);
          } else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
        })
     }

    // Create app [appName]
    else if (query.substring(0, 10) == 'create app') {
      var queryArray = query.split(' ');
      var appName = queryArray[2];
       request.put({headers: {'content-type' : 'application/json'},
        url: `${endPoint}/apps/${appName}?apiToken=${secrets.users[username]}`}, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            returnData = `App *${appName}* has been created ${username} :thumbsup:`;
            callback(returnData);
          }
          else {
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
        })
     }

     // Create env [envName] for app
     else if (query.substring(0, 10) == 'create env') {
      var queryArray = query.split(' ');
      var envName = queryArray[2];
      var appName = queryArray[5];

      request.put({headers: {'content-type' : 'application/json'}, 
        url: `${endPoint}/apps/${appName}/envs/${envName}?apiToken=${secrets.users[username]}`},
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            returnData = `Env *${envName}* has been created ${username} :thumbsup:`;
            callback(returnData);
          } else {
            console.log(error, response.statusCode, response.body);
            returnData = `Uh-oh, looks like something went wrong ${username}!`;
            callback(returnData);
          }
      })
    }

    // Restart env [envName]
    else if (query.substring(0, 11) == 'restart env') {
      var queryArray = query.split(' ');
      var envName = queryArray[2];
      var appName = queryArray[5];

       request.put(`${endPoint}/envs/${envName}/restart?apiToken=${secrets.users[username]}`,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            returnData = `Env *${envName}* has been restarted ${username}`;
            callback(returnData);
          } else {
            var contents = JSON.parse(body);
            returnData = `That environment does not exist ${username}`;
            callback(returnData);
          }
        })
     }

    // List releases for app [appName]
    else if (query.substring(0, 21) == 'list releases for app') {
      var queryArray = query.split(' ');
      var appName = queryArray[4];
       request(`${endPoint}/apps/${appName}/releases?apiToken=${secrets.users[username]}&max_results=25&order=desc`,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            var returnData = [];
            for (var i = 0; i < contents.releases.length; i++) {
              var desc = contents.releases[i].description;
              returnData.push(`<${contents.releases[i].html_url}|${contents.releases[i].release_version}:${desc}>`);
            }
            callback(returnData);
          } else {
            returnData = `We could not find app ${appName}, ${username}!`;
            callback(returnData);
          }
      })
    }

    // Latest release for app [appName]
    else if (query.substring(0, 22) == 'latest release for app') {
      var queryArray = query.split(' ');
      var appName = queryArray[4];
       request(`${endPoint}/apps/${appName}/releases?apiToken=${secrets.users[username]}&max_results=25&order=desc`,
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var contents = JSON.parse(body);
            returnData = `Here is the latest release for ${appName},
            ${username}:${contents.releases[0].release_version}: ${contents.releases[0].description}`;
            callback(returnData);
          } else {
            returnData = `We could not find app ${appName}, ${username}!`;
            callback(returnData);
          }
      })
    }

     // Deploy latest to env [envName]
     else if (query.substring(0, 20) == 'deploy latest to env') {
      var queryArray = query.split(" ");
      var envName = queryArray[4];
      request(`${endPoint}/envs/${envName}?apiToken=${secrets.users[username]}`, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var contents = JSON.parse(body);
          var appName = contents.env.app_name;
          request(`${endPoint}/apps/${appName}?apiToken=${secrets.users[username]}`, function(error, response, body){
            if (!error && response.statusCode == 200) {
              var appContents = JSON.parse(body);
              var latestRelease = appContents.app.latest_release.release_version;
              request.post({headers: {'content-type' : 'application/json'},
                url: `${endPoint}/envs/${envName}/deploy?apiToken=${secrets.users[username]}`,
                  body: JSON.stringify({"release_version": latestRelease, "description":
                    `Deploy via Slack by ${username}`})}, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                      var releaseContents = JSON.parse(body);
                      returnData =`<${releaseContents.deployment.html_url}|Release ${latestRelease} has been
                      deployed to env ${envName} ${username}!>`;
                      callback(returnData);
                    } else {
                      returnData = `We could not find env ${envName}, ${username}!`;
                      callback(returnData);
                    }
                  })
            } else {
              returnData = `We could not find that env, ${username}!`;
              callback(returnData);
            }
          })
        } else {
          returnData = `We could not find that env, ${username}!`;
          callback(returnData);
        }
      })
    }

    // Deploy [releaseNum] to env [envName]
    else if (query.substring(0, 8) == 'deploy v') {
      var queryArray = query.split(' ');
      var releaseNum = queryArray[1];
      var envName = queryArray[4];
      request.post({headers: {'content-type' : 'application/json'},
        url: `${endPoint}/envs/${envName}/deploy?apiToken=${secrets.users[username]}`,
        body: JSON.stringify({"release_version": releaseNum, "description": "Deploy via Slack by " + username})},
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log(body);
            var releaseContents = JSON.parse(body);
            returnData = `<${releaseContents.deployment.html_url}|Release ${releaseNum} has been deployed to env ${envName} ${username}!>`;
            callback(returnData);
          } else {
            console.log(body);
            returnData = `We couldn not find env ${envName}, ${username}!`;
            callback(returnData);
          }
        })
     }

    // Help
    else if (query == 'help') {
      returnData = 'Here are the commands I recognize:\n•List Apps\n•List Builds\n•List Envs\n•List Servers\n' +
      '•List Servers for Env [Env Name]\n•List Release for App [App Name]\n•Create App [App Name]\n' +
      '•Create Env [Env Name] for App [AppName]\n•Restart Env [Env Name]\n•Latest release for app [appName]\n' +
      '•Deploy latest to env [envName]\n•List Envs for App [AppName]\n•Deploy [vXX] to env [envName]';
      callback(returnData);
    }

    // Default text
    else {
      returnData = 'I didn not recognize that command ' + username + '. Here are the commands I recognize:\n•List Apps\n' +
      '•List Builds\n•List Envs\n•List Servers\n•List Servers for Env [Env Name]\n•List Release for App [App Name]\n' +
      '•Create App [App Name]\n•Create Env [Env Name] for App [AppName]\n•Restart Env [Env Name]\n•Latest release for app [appName]\n' +
      '•Deploy latest to env [envName]\n•List Envs for App [AppName]\n•Deploy [vXX] to env [envName]';
      callback(returnData);
    }
  }
  // If slack creds sent aren't equal to env variables
  else {
    returnData = `Bad Slack Creds. Make sure you have set env variables for SLACKTEAM, SLACKTOKEN, USERNAME and APITOKEN, ${username}`;
    callback(returnData);
  }
}

app.listen(port, function() {
  console.log(`Distelli-Slash is alive on port ${port}.`);
})