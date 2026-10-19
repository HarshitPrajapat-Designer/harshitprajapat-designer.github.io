# Harshit Prajapat Portfolio

A static website. No build tools. Open `index.html` in a browser, or upload the whole folder to GitHub Pages.

## Folder map

```
harshit-portfolio/
├── index.html                 The page. Every section has a comment above it.
├── css/
│   ├── main.css               Looks. Has separate LIGHT MODE and DARK MODE parts.
│   └── responsive.css         Phone, tablet and big-screen fixes (light / dark blocks inside).
├── js/
│   └── main.js                Animations, dark mode button, image loader, 3D background.
├── assets/
│   ├── cv/                    Harshit_Prajapat_CV.pdf   (the Download CV buttons use this)
│   └── img/
│       ├── hero/              Your portrait
│       ├── portfolio/
│       │   ├── mobile/        Monity, Traders Hub, Solar 4 Good
│       │   ├── web/           Young Rocket
│       │   └── graphic/       Posters, logos, brand work
│       ├── story/             NEW: 3 "messy screen" images (Chapter 02)
│       ├── craft/             NEW: Figma screenshot + live code screenshot (Chapter 05)
│       └── roles/             NEW: 3 role photos (Chapter 07)
└── README.md
```

## How to replace an image (no code needed)

1. Find the file name in the tables below.
2. Save your image in that folder with the **same name**.
3. The type can be `.webp`, `.jpg`, `.png` or `.jpeg`. The page finds it by itself.
4. Refresh the page.

If an image file is missing, the page shows a dashed box that says **what** to add, **what type** it should be, and **where to save it**.

## Images you still need to add (the page shows dashed boxes for these)

| Chapter | What the image is | Type and size | Save as |
|---|---|---|---|
| 02 The problem | An OLD or messy screen (for example one of your apps before the redesign, or any crowded screen you fixed) | Screenshot, 1200 × 750 px (16:10) | `assets/img/story/before-1` |
| 02 The problem | A second old or messy screen | Screenshot, 1200 × 750 px | `assets/img/story/before-2` |
| 02 The problem | A third old or messy screen | Screenshot, 1200 × 750 px | `assets/img/story/before-3` |
| 05 The craft | ONE page in Figma, for example the Young Rocket video page | PNG or JPG, 1600 × 1000 px (16:10) | `assets/img/craft/figma-design` |
| 05 The craft | The SAME page running in the browser from your code | PNG or JPG, 1600 × 1000 px (16:10), same crop as the Figma image | `assets/img/craft/live-code` |
| 07 The roles | Your photo, or a Figma board screenshot with your UI/UX work | Photo or screenshot, 1200 × 900 px (4:3) | `assets/img/roles/ui-ux-designer` |
| 07 The roles | A screenshot of your code editor, or a live site you built | Screenshot, 1200 × 900 px (4:3) | `assets/img/roles/ui-developer` |
| 07 The roles | A frame from your After Effects or Premiere Pro project | Screenshot or still frame, 1200 × 900 px (4:3) | `assets/img/roles/multimedia-designer` |

### Chapter 05 tip
Both images must show the **same page** with the **same crop and size**. When visitors scroll, a line slides across and shows the Figma design turning into the real code.

## Images already included (copied from your old site and made smaller)

| Folder | Files |
|---|---|
| `assets/img/hero/` | `harshit-portrait` |
| `assets/img/portfolio/mobile/` | `monity-1`, `monity-2`, `traders-hub-1`, `traders-hub-2`, `solar-4-good-1`, `solar-4-good-2` |
| `assets/img/portfolio/web/` | `young-rocket-1`, `young-rocket-2`, `young-rocket-3` |
| `assets/img/portfolio/graphic/` | `auraa-1`, `auraa-2`, `microlent-1`, `microlent-2`, `logos-1`, `logos-2`, `tent-card` |

They are `.webp` files. The old PNG files were 45 MB in total. These are about 1.7 MB, so the page loads much faster.
To swap any of them, save a new image with the same name.

## How to change the text

Open `index.html`. Each section starts with a comment like `<!-- ===== 4. PROOF ===== -->`. The text sits right below it.

## How the CSS is split

- `css/main.css`
  1. LIGHT MODE colors, 2. DARK MODE colors, then base, components, sections, **LIGHT-only tweaks**, **DARK-only tweaks**.
- `css/responsive.css`
  Screen sizes from big to small: large displays, small laptop, tablet, phone, small phone, short screens.
  Inside each size: `ALL THEMES`, `LIGHT ONLY`, `DARK ONLY`.

To change a color, edit the variables at the top of `main.css` (parts 1 and 2).

## CV button

The "Download my CV" buttons download `assets/cv/Harshit_Prajapat_CV.pdf`.
To update your CV, replace that file and keep the same name.

## Publish on GitHub Pages

1. Open your repository `harshitprajapat-designer.github.io`.
2. Delete the old site files, then upload everything inside this folder (keep the same structure).
3. Wait 1 to 2 minutes, then open your site.
