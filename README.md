# Sound Sets (Local) Plugin

This plugin adds a command that can push a Syrinscape URI to a locally running Syrinscape desktop client ("Genre Player"), not the online player.  This is initially implemented only for Fantasy Player.   This plugin is needed on MacOS, because the custom URI protocol handler for Syrinscape URIs is missing on that platform.  It also works on Windows.

## Automatic Button Generation

Copying and pasting a link from the Syrinscape app into the Obsidian page will automatically create a button command instead of just placing the link.
In order to automatically name the button for any link that is a known sound set, place the CSV file of all the sound set URLs in the root folder of your Obsidian vault.  You can get your customized copy of that file here: [CSV download from Syrinscape after you log in on their site](https://syrinscape.com/account/remote-control-links-csv/)
