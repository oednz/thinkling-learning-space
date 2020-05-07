# Thinkling Learning Space
## Web-based, Collaborative, Rich Media Curation and Presentation Tool for Educators and Students  

Thinkling Learning Space is a modified version of Spacedeck Open (https://github.com/spacedeck/spacedeck-open), based specifically on master branch up to commit 79a3d39. 
The first commit of this modified version incorporates minor bug fixes, improvements in the UI, and one new feature for now. The overall aim is to align more closely to the needs and requirements of the education community.
Further fixes, modifications and new features are expected as we receive feedback from users while relying on code contributions and collaboration from the technical community.        

# Demo and Sandbox

Visit our [demo](https://demo.thinkling.org) and use credentials: demo@thinkling.org and Password: demo123

# Requirements, Installation

- Node.js 10.x: Web Server
- To install all node dependencies run:
    
    npm install

# Configuration

See [config/default.json](config/default.json)
You may also tweak [models/default.db](models/default.db) if you want to point to a different database file.

# Run (web server)

    node thinkling.js

Then open http://localhost:9666 in a web browser.

# Media Conversion Dependencies

- ffmpeg and ffprobe for video/audio conversion
- audiowaveform for audio waveform rendering
- ghostscript for PDF import
- GraphicsMagick for image resize conversion


# CSS
 - To expedite a quick launch [public/stylesheets/style.css](public/stylesheets/style.css) has been crudely modified. In future releases you'll be able to rebuild the frontend CSS using gulp.

# TODO
## Immediate
- Tidy up code and styles
- Update existing /replace obsolete modules
- Fix touch events on non-touch devices
- More stringent security for login and sign-up
- Fix thumbnail rendering for SVG and Streaming video embeds 
- Fix email confirmation     

## Long Term
- Replace phantom.js with a modern alternative
- Add MathJax or KATEX support
- Replace current scribble tool with something more usable
- Fix save as zip issue
- Develop an interface to display all public & authorized spaces 

# Contributing

We need your knowledge, insights, and expertise to bring this community effort to the next level. In general, using the issues register with suggestions, bug reports and code improvements is a good start. If you would like to contribute directly contact the Organization's admin to get access.        

# License

Thinkling Learning Space code is released under the GNU Affero General Public License Version 3 (GNU AGPLv3).

    
    Thinkling Learning Space - Web-based, Collaborative, Rich Media 
    Curation and Presentation Tool for Educators and Students 
    Copyright (C) 2020 Farnousch Sinclair, Education Foundation NZ

    Spacedeck Open - Web-based Collaborative Whiteboard For Rich Media
    Copyright (C) 2011-2018 Lukas F. Hartmann, Martin Güther
    Icons and original CSS design copyright by Thomas Helbig
    
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
