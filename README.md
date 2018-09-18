# Enmap-Express (work in progress)
*This is a tentative name that will change*

This package started out as a very simple way for me to test & prove that Enmap was easy to use an integrate into an express.js app. 
The best way, I thought, to do this, was to write a blog platform. So I started doing that. And then I wrote an admin for it. Then
I started writing an API for it. Then a CLI feature.

And now we have this. This is a boilerplate for making your own blog. It's not *meant* to be directly used as-is, because the styling
is pretty basic, the wording of the templates is not-funny-to-passive-agressive, and it might still be missing features *you* want in
a blog platform. But, it's at least secure enough (passwords are salted, hashed, bcrypted, the API is token-secured, etc), and stable
enough, that it's useable in its current state.

## Pre-Requisites

Enmap-Express uses `enmap` for data storage, which is a wrapper around better-sqlite3. Thus, the data is in fact stored in sqlite.
But, as with any sqlite module on node, it requires a build system to work. Rather than reproduce my enmap docs here, let me point
you to [the pre-requisites docs](https://enmap.evie.codes/install#pre-requisites). Please follow the instructions in the tabbed box
for your operating system, then come back here.

## Getting and Installing

To install Enmap-Express, once the pre-requisites are properly installed, open a new command prompt and type the following commands:

```
git clone https://github.com/eslachance/enmap-express.git
cd enmap-express
npm install
```

You also have to copy `config.json.example` to `config.json` and edit its contents to your desired configuration: 

- `saltRounds`: Used for bcrypt. More rounds means more secure, but a little slower.
- `secret`: The secret used for salting sessions. Can be just any unique string.
- `port`: The port you want the http server to listen on. 8080 by default, 80 for the regular http port.

Once you've saved the config.json file, simply run `node .` and it should start the blog server.

## Additional Utilities

There are 2 useful tools you might want to consider for use with this module. 

### pm2

pm2 is a process manager, meaning it can keep your project running even if you close the command prompt. It also gives you the console
log output of your project and saves it to a log file, making for easy and painless debugging and running.

Initial Setup:
```
npm i -g pm2
pm2 start index.js --name="myblog"
```

Other Commands: 

- `pm2 logs myblog` to see the logs in realtime
- `pm2 stop myblog` to stop the project
- `pm2 start myblog` to start the project in the future
- `pm2 restart myblog` to... you get the picture, right?
- `pm2 save` to save the current configured app to a file
- `pm2 resurrect` to restore the saved configuration after a computer reboot.

### ngrok

ngrok is an http tunnel, meaning it can give you a public URL for your project so you can show it off. With a paid subscription you can
also have a custom subdomain that's permanent, but by default it will change every time you launch it. 

- Follow [The setup instructions](https://dashboard.ngrok.com/get-started) to download, configure, and setup ngrok initially.
- Make sure the ngrok.exe file is in your PATH (or in the same folder as your project)
- Run `ngrok http 8080` (or replace with your port in config.json) to start the tunnel. 

As long as ngrok is running, the "Forwarding" URL shown in the console log will be your blog's public address.

## Documentation / API

To be done. I'll wait for them to be actually complete before I document them :P