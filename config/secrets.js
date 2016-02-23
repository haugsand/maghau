module.exports = {
  team: {
    username: process.env.USERNAME,
    slackToken: process.env.SLACKTOKEN,
    slackTeam: process.env.SLACKTEAM
  },
  users: {
    //Replace with your Slack User Name: Set an environment variable with your Distelli API Token
    "al": process.env.APITOKEN,
    "rsingh": process.env.APITOKEN,
    "boris": process.env.APITOKEN
  }
}
