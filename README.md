# PiyushaOS

My portfolio, built as a little desktop operating system that runs in the browser. It boots, shows a login screen, and then gives you a desktop where you can open my experience, projects, research and more as draggable windows.

I'm Piyusha Patil, an MSc Computer Science student at KTH Royal Institute of Technology and a Research Assistant working on token efficiency for LLM coding agents.

## What's inside

| App | What it shows |
| --- | --- |
| About Me | Who I am, education, and what I work on |
| Experience | Research, industry and student roles |
| Projects | Selected projects with code and demo links |
| Research | Publications, including the IEEE PuneCon 2025 Best Paper |
| Achievements | Awards and competitions, with proof links |
| Skills | Languages, ML / AI tools, frameworks and databases |
| Terminal | A working shell over a virtual filesystem of my profile |
| Resume.pdf | My CV, viewable and downloadable |
| Contact | A form that drafts an email to me |
| Settings | Wallpapers and preferences |

### Try the terminal

Open the Terminal and type `help`. Some favourites:

```
whoami
neofetch
cd projects && ls
cat experience/kth-assert.md
open research
wallpaper nebula
```

Tab autocompletes, and the up and down arrows browse your history. There is also a hidden file if you know how to look for it.

## Running it locally

You need Node.js 18 or later.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

To build a production version:

```bash
npm run build     # outputs to dist/
npm run preview   # serves dist/ at http://localhost:4173
```

The build uses relative paths, so the `dist/` folder can be deployed to any static host such as GitHub Pages, Netlify or Vercel.

## Updating the content

All of the content lives in one file: [`src/data/profile.json`](src/data/profile.json). Experience, projects, publications, achievements and skills are all read from it, including the files you see in the Terminal. Edit the JSON and the whole site updates.

The CV shown in Resume.pdf is [`public/Piyusha_Patil_CV.pdf`](public/Piyusha_Patil_CV.pdf).

## Project structure

```
src/
  apps/          one component per app, plus registry.js listing them all
  components/    the OS shell: boot screen, login, desktop, dock, menu bar, windows
  data/          profile.json, the single source of content
  os.js          shared OS state, wallpapers and saved preferences
  styles.css
public/          static files such as the CV
```

## Built with

React 18, Vite 5 and lucide-react icons. No UI framework, just hand-written CSS.

## Contact

- Email: ppiyusha2001@gmail.com
- LinkedIn: [piyusha-patil-o17102001](https://www.linkedin.com/in/piyusha-patil-o17102001/)
- GitHub: [piyusha2001](https://github.com/piyusha2001)
