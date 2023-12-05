# Webpack Starter Course

[YouTube Walkthrough](https://www.youtube.com/watch?v=IZGNcSuwBZs)

Make src and dist folders.

* src: where the files we edit are.
* dist: where files will be generated to.

Make an index.html file (later we install HTML plugin so you don't edit the dist html you edit a src one)

Make src/index.js and linked in html. Open in live server. It works.

Made generateJoke.js and made a function, exported it and imported in index.js. **Doesn't work, cant use import outside a module. Now we need webpack.**

```bash
$npm init -y //creates a new node package.json
$npm i -D webpack webpack-cli // installs webpack as a dev dependency and webpack CLI so we can run commands
```

Add script to package.json. Since we don't have a config file yet we specify config after webpack:

```js
"build": "webpack --mode production" 
```

Update index.html to point to the new main.js that webpack generates.

```html
<script src="./main.js"></script>
```

```bash
$npm run build
```

It works. Now we can use npm modules and our own js modules. Gotta rebuild when we add stuff.

## 9:55 Making a config file

Make webpack.config.js in root (that's the name and location where webpack automatically looks). Add mode, entry and output. Remove those elements from the build script.

* Path: a node module for handling filepaths across different OSs.
* path.resolve creates a file path that works regardless of OS
* __dirname is a node.js global variable representing the current directory of the script so in this case root.

```js
const path = require('path')

module.exports = {
    mode: "development",
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}
```

To set different outputs make entry an object. Here [name.js] will take the key of the entry object as its filename, ie: "bundle".

```js
module.exports = {
    mode: "development",
    entry: {
        bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
}
```

## Loaders

So you can load images, CSS, SASS etc. Install loaders:

```bash
$npm i -D sass style-loader css-loader sass-loader
```

Create a SASS file in src/styles/main.scss. Added a bunch of code to it. Import it into index.js.

* Won't work because loaders have been installed but not setup.

To deal with loaders add a module object to webpack.config with a rules array, containing an object for each file type.

```js
module: {
        rules: [
            {
                test:/\.scss$/, // "for any file ending in this extension
                use: [ // apply these loaders
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
```

It works!

## Plugins

Plugins are more powerful than loaders, lots of uses.

HTML plugin: don't want to have to edit the index.html file each time you change stuff. You want to just delete the dist folder and have it re-build on $npm run build.

install it:

```bash
$npm i -D html-webpack-plugin
```

Bring into webpack.config.

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
```

Add plugins array.

```js
plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack Application',
            filename: 'index.html', // now outputting the dist html
            template: 'src/template.html' // where we make html changes
        })
    ]
```

Cache busting: when you update the app you don't want the browser to use a cached version. By using the webpack placeholder [contenthash] Every time the content of bundle changes webpack will make a new filename and will update src of index.html to use the new bundle. This leads to faster load times and better performance.

```bash
 output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name][contenthash].js'
    }
```

## Webpack Dev Server 22:22

To make the bundle auto reload.

In package.json add a script for dev:

```bash
  "scripts": {
    "build": "webpack",
    "dev": "webpack serve"
  },
```

And run npm run dev. It will ask if we want to install webpack dev server (yes duh). By default it runs on localhost:8080.

It works. But now we want to customize it with a devServer object in webpack.config:

```js
devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist') 
        },
        port: 3000, // preference for port
        open: true, // auto open in browser when you run it 
        hot: true, // hot reloading
        compress: true, // gzip compression for optimization
        historyApiFallback: true, // IMPORTANT: when using client side routing like React Router the URL might not correspond to an actual file on the server so if they manually enter larsoncollier.com/cartoons it might give an error. HistoryApiFallback serves index.html for an address that doesn't have a file and then allows client side routing to take over.
    },
```

* The dev server is serving from memory not from the dist folder.

Currently every time you run $npm run build, because of the [contenthash] bundles will keep piling up. To make it only keep the latest file you can update the output object in config:

```js
output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
},
```

## Source Maps

Source maps help debugging. You'll often get a line code in the console that doesn't correspond with an actual line in your source code. Source code make a map from source to production code. In config add:

```js
    devtool: 'source-map',
```

This will create a js.map file in dist. When you get an error in your console it give a line number for your bundle (ex:  bundlee43dfc456cb4865da9af.js:638:13 not helpful). Go to dev tools>sources>dist>yadayada.js.map and find that line. You will see the error as it appears in your source code.

## Babel Loader

Babel is a JS transpiler (changes code) to make code backwards compatible with older browsers. Install @babel/preset-env to use latest js features and not have to specify anything.

```bash
$npm i -D babel-loader @babel/core @babel/preset-env
```

Add a new object in webpack.config rules:

```js
{
    test: /\.js$/, // run transpiler on all js files
    exclude: /node_modules/, // except node modules. These are usually distributed in a pre-transpiled format like CommonJS. This skips  unnecessary transpilation, avoids needless complexity, or possible issues, increases build time.
    use: {
        loader: 'babel-loader',
        options: {
            presets: ['@babel/preset-env']
        }
    }
}
```

$npm run build and it still works. Woo!

## Image Loading

Add src/assets folder and sample.svg. In index.js

```js
import sample from './assets/sample.svg'
```

*If you run build It will say you don't have a loader.

Don't need to install anything, webpack comes with an asset loader but you must specify with a new rule object in config:

```js
{
    test: /\.(png|svg|jpg|jpeg|gif)$/i, // | means or, i means case-insensitive
    type: 'asset/resource'
}
```

...and update output so that assets keep their name and extensions:

```js
output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name][contenthash].js',
    clean: true,
    assetModuleFilename: '[name][ext]'
    },
```

Now it can handle images. In template.html add <img id="sampleImage"> and in index.js add:

```js
import sample from './assets/sample.svg'

const sampleImage= document.getElementById("sampleImage")
sampleImage.src = sample
```

Woo! Don't you miss Vite?

## Axios

```bash
$npm i axios
```

Axios is a JS Library for HTTP requests. An alternative to fetch. It autimatically converts JSON responses to JS objects with properties like data, status and headers. It has lots of features like a Cancel token, validateStatus option to set specific criteria for a successful req etc.

Here's an example GET request:

```js
axios.get('https://api.example.com/data')
  .then(response => {
    // handle success
    console.log(response.data);
  })
  .catch(error => {
    // handle error
    console.error('Error:', error);
  });
```

We update the generateJoke function and add an click event to the button in index.js. Then run build or dev again. The config specifies that we expect JSON back.

## Bundle Analyzer

Kinda cool, not important. Shows a screen of what app is built from, what takes up the most space. Import it in config and add it to the plugins:

```bash
$npm i -D webpack-bundle-analyzer
```

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

plugins: [
        new HtmlWebpackPlugin({
            title: 'Webpack Application',
            filename: 'index.html',
            template: 'src/template.html'
        }),
        new BundleAnalyzerPlugin()
    ]
```

Now when we $npm run build it opens a visual representation of our application on <http://127.0.0.1:8888/>
