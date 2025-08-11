<p align="center" style="font-size: 40px;">Scraper/Builder for <a href="https://www.flaticon.com/uicons/interface-icons" target="_blank">FlatIcon Interface Icons</a></p>

![flaticon-icons](https://raw.githubusercontent.com/ethalium/flaticon-icons/refs/heads/main/preview.png "flaticon-icons preview")

Because it looks like the original [FlatIcon Repository](https://github.com/freepik-company/flaticon-uicons) is not maintained actively anymore, I created this project to get all available icons from
the [FlatIcon Website](https://www.flaticon.com/uicons/interface-icons) by downloading the information about all icons and their SVGs. With the SVGs the script builds the fonts and styles.

## Files
* **SCSS:**
  * `dist/assets/flat-icons.scss` | All icons
  * `dist/assets/scss/<style-family>.scss` | Styles for each available styleFamily
* **SVGs:**
  * `dist/assets/svgs/<style-family>/<icon>.svg` | SVGs for each icon
* **Fonts:**
  * `dist/assets/webfonts/<style-family>.{woff,woff2,eot}` | Fonts for all icons
* **Typescript:**
  * `dist/data/icons.data.ts` | All available icons
  * `dist/data/icons.type.ts` | Type definitions for icons

## Build
```bash
# install packages
npm install

# clear cache
npm run cache:clear

# build everything
npm run build

# build separate data
npm run build:icons   # > build icons only
npm run build:svgs    # > download svgs
npm run build:fonts   # > build fonts
npm run build:data    # > build typescript definitions
npm run build:styles  # > creating stylesheets and html preview
```

## Usage
### CSS
```scss
// import everything
@forward "dist/flat-icons.scss";

// import specific types only
@forward "dist/scss/bold-rounded.scss";
...
```

### HTML
```html
<span class="fi fi-bc-globe"></span>
```

##
## License:

---
Make sure to ``attribute the owner`` of the icons according to the [FlatIcon Attribution Guide](https://support.flaticon.com/s/article/Attribution-How-when-and-where-FI?language=en_US). If you're a Premium user, you do not need to attribute the owner.
