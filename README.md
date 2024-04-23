<img src="https://i.ibb.co/yXbSq1b/PANGOLIN.png" alt="PANGOLIN" align="center" border="0" width="100%">
<p align="center">A simple Facebook Messenger Bot using personal account with framework <a href="http://nestjs.com" target="_blank">NestJs</a></p>
<p align="center">
    <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
    <a href="https://paypal.me/" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>  
    <a href="https://www.facebook.com/bossvirus03" target="_blank">
      <img alt="Static Badge" src="https://img.shields.io/badge/facebook-blue?logo=facebook" href="https%3A%2F%2Fwww.facebook.com%2Fbossvirus03">
    </a>
</p>

## Installation
<ul>
<li align="left">Download <a href="https://nodejs.org/en/">Nodejs</a> & <a href="https://git-scm.com/">Git</a></li>
<li align="left">Open git bash & enter</li>
</ul>


```bash
$ git clone https://github.com/bossvirus03/Pangolin.git
```
<p>and then</p>

```bash
$ npm install
```

## Some settings to get started
<ul>
    <li>Download <a href="https://github.com/c3cbot/c3c-fbstate">c3c fbstate</a> to get fbstate</li>
    <li>Add that extension to chrome or any browse</li>
    <li>Log in to your Facebook account, <b>remember not to use your main account</b></li>
    <li>Copy fbstate and paste into the appstate.json file located in the root directory</li>
    <li>Instructional video <a href="https://www.youtube.com/watch?v=mFVtTPg4sWQ&t=97s">Here</a></li>
</ul>

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Note

<ul>
    <li>This is a messenger chat bot using a personal account, using <a href="https://github.com/Schmavery/facebook-chat-api">facebook-chat-api</a> and this is not supported from Facebook, so its use may result in the account being locked due to spam or some other reason.</li>
    <li>i'm not responsible if your account gets banned for spammy activities such as sending lots of messages to people you don't know, sending messages very quickly, sending spammy looking URLs, logging in and out very quickly... Be responsible Facebook citizens.</li>
</ul>

## Example Usage

<img src="https://i.ibb.co/Ytzdjds/Screenshot-2024-04-21-191605.png" alt="Screenshot-2024-04-21-191605" border="0">

## Example create modules

<li>From root directory to /src/modules/commands or /src/modules/events and then you need follow template <a href="https://github.com/bossvirus03/Pangolin/blob/master/src/modules/template.ts">Here</a></li>




### With prefix
```javascript
import { IPangolinRun } from "src/types/type.pangolin-handle";
 async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
    pangolin,
  }: IPangolinRun) {
    // logic here
  }
```

### Listen event from command has prefix

```javascript
import { IPangolinListenEvent } from "src/types/type.pangolin-handle";
 async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
    pagolin,
  }: IPangolinListenEvent) {
    // logic
  }
```

### No prefix
```javascript
import { IPangolinNoprefix } from "src/types/type.pangolin-handle";
 async noprefix({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
    pangolin,
  }: IPangolinNoprefix) {
    // logic
  }
```
### Something you need to know
<ul>
    <li>From functions handle command</li>
</ul>

```javascript
async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
    pangolin,
  }: IPangolinRun){}
```

<p>In the code above</p>

#### api
<p>Example: send a message</p>

```javascript
    api.sendMessage("hello world", event.ThreadID)
```
<p>To see detail you need to <a href="https://github.com/bossvirus03/facebook-chat-api">Here</a></p>

#### event

<p>Some event you need to know</p>

<ul>
    <li>event.type</li>
    <li>event.messageID</li>
    <li>event.threadID</li>
    <li>event.isGroup</li>
    <li>event.body</li>
    <li>event.senderID</li>
    <li>...<a href="https://github.com/bossvirus03/Pangolin/blob/master/src/types/type.event.ts">Here</a></li>
</ul>

#### args

##### Example

<p>If you receive a message which is "nguyen van a", then args[0] = "nguyen", args[1] = "van", args[2] = "a"</p>

#### UserData

<p>Example get a user</p>

```javascript
const user = await UserData.get("61556745520442");
console.log(user)
//response
/*
   User {
        uid: "",
        name: "",
        exp: 0,
        money: 0,
        prefix: ""
    }
*/
```
#### ThreadData

<p>Example get a thread</p>

```javascript
const thread = await ThreadData.get("47923492740238");
console.log(thread)
//response
/*
   Thread {
        name: "",
        tid: "",
        prefix: "",
        rankup: false,
        resend: false,
    }
*/
```

#### UserInThreadData

<p>Example get a user in group</p>

```javascript
const userInThread = await UserInThreadData.get("61556745520442","47923492740238");
console.log(userInThread)
//response
/*
   UserInThread {
        name: "",
        uid: "",
        uniqueId: "",
        tid: "",
        countMessageOfDay: 0,
        lastDayUpdate: "",
        countMessageOfWeek:0,
        lastWeekUpdate: ""
    }
*/
```

#### pangolin

<p>To get all config of current bot</p>

```javascript
const config = pangolin;
console.log(config);
// response
/*
   {
    "botname": "heloo",
    "admins": [
        "100049732817959",
        "100000113681117"
    ],
    "prefix": ";",
    "commands": {
        "youtube_search_api": ""
    },
    "access_token": "",
    "log_event": false,
    "help_paginate": false
} 
*/
```


## Stay in touch

- Author - [bossvirus03](https://nghuuloidev.click) along with contributions from <a href="https://github.com/Nguyenblur">Nguyenblur</a> and <a href="https://github.com/dev-ndk">dev-ndk</a>
