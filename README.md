# Dashboard Assistant
- **Authors**:		Simon Balz <simon@balz.me>, Christoph Dittmann <mulibu.flyingk@gmail.com>
- **Description**:	Manage and include help texts and classifications for dashboards and panels
- **Version**: 		1.0.4

## Features
The Dashboard Assistant adds support to classify and set help texts on dashboard or panel level to Splunk. Classification helps users to identify if the data shown in the dashboard or in a specific panel is critical or not. Help texts and classifications can be added depending on a app version, so you can prepare your help texts even before you deploy your new app release. The Dashboard Assistant also adds contact information of the dashboard owner to the description.

## Release Notes

## Changelog

## Credits
- Datatables (https://www.datatables.net/)
- Mistune (https://github.com/lepture/mistune)

## Prerequisites
- Splunk v6.2+ (we use the App Key Value Store)

## Installation and Usage
1. Install it on your Search Head
2. Add the dashboard assistant to your dashboards:

`<dashboard script="dashboard_assistant:dashboard_assistant.js" stylesheet="dashboard_assistant:dashboard_assistant.css">`

or for forms:

`<form script="dashboard_assistant:dashboard_assistant.js" stylesheet="dashboard_assistant:dashboard_assistant.css">`

3. Add your help entries in the Help Entry Editor
4. Be amazed :)

## Markdown File integration
1. save your markdown file within the app you want to add it to
2. Add the dashboard assistant markdown integration to your dashboard:

`<dashboard script="dashboard_assistant:markdown.js" stylesheet="dashboard_assistant:markdown.css">`

or for forms:

`<form script="dashboard_assistant:markdown.js" stylesheet="dashboard_assistant:markdown.css">`

## Roadmap
- Inline Editor
- Permissions
- 

## Known Issues
- n/a

## License
This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License (http://creativecommons.org/licenses/by-nc-sa/4.0/).
Commercial Use, Excerpt from CC BY-NC-SA 4.0:
>"A commercial use is one primarily intended for commercial advantage or monetary compensation."