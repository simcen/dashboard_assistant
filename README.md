# Dashboard Assistant
- **Authors**:		Simon Balz <simon@balz.me>
- **Description**:	Manage and include help texts and classifications for dashboards and panels
- **Version**: 		1.0.1

## Introduction

## Features
The Dashboard Assistant adds support to classify and set help texts on dashboard or panel level to Splunk. Classification helps users to identify if the data shown in the dashboard or in a specific panel is critical or not. Help texts and classifications can be added depending on a app version, so you can prepare your help texts even before you deploy your new app release. The Dashboard Assistant also adds contact information of the dashboard owner to the description.

## Release Notes

## Changelog

## Credits

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

## Roadmap
- Inline Editor
- Permissions
- 

## Known Issues


## License
