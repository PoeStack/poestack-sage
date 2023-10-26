# Roadmap

For now I'll just keep this as a general todo list.

Steps needed to enter pre-alpha (build only):
- Setup user profile/authentication
- Add leagues, characters, profile to the api
- Add Client.txt event tailing
- Add PoeStack pricing info to the api
- Add top/bottom bar to the UI
- Add visible version to the UI
- Switch to icons only in the sidebar
- Add a general guard panel for ensuring connection
- Test the Windows build

Steps needed to enter alpha (releases):
- Figure out how our Sqlite implementation should be used by scripts
- Move these docs to mdBook
- Add automatic updating for install versions
- Add a button to the v1 to make authentication not require copy/paste
- Add a basic stash tracking/character tracking plugin
- Add a plugin managment plugin to enabled/disable and install/uninstall/update plugins
- Work more on themeing, add a theme selector
- Test the Windows installer

Steps needed to enter beta:
- Add ability to connect a Discord account
- Feature parity for stash tracking plugin
- Setup new TFT integration on the backend
- Add TFT integration to the api
- Add TFT livesearch/bulk tool plugins  

# Long term ideas
- Add API for sending users Discord messages
- Add API for interacting with local item filters, it would be nice to have a way to enable filters to automatically adjust to econmoic data or active account
- Add overlay API to allow plugins to overlay POE
- Add API for interacting with locally installed POB
