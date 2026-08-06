# Vendored prototype runtime

The CEG prototype renders `/public/ceg/*.jsx` in the browser: React 18 (UMD) and
Babel standalone are loaded first, then each `.jsx` file is fetched, transformed,
and executed as a classic script.

These three bundles were previously pulled from `unpkg.com` at runtime, which
meant an unpkg outage — or any network that blocks it — rendered the entire site
blank. They are vendored here so the site is self-contained and same-origin.

| File          | Source                                       |
|---------------|----------------------------------------------|
| `react.js`    | `react@18.3.1/umd/react.production.min.js`    |
| `react-dom.js`| `react-dom@18.3.1/umd/react-dom.production.min.js` |
| `babel.js`    | `@babel/standalone@7.29.0/babel.min.js`       |

Refresh them with the pinned `react-18`, `react-dom-18`, and `@babel/standalone`
devDependencies in `package.json`.

⚠ Shipping a ~3 MB Babel bundle and transforming JSX in the browser on every
page load is a prototype-stage arrangement, not a launch-ready one. It should
disappear when the pages are ported to real server-rendered components — see the
launch checklist (Section 19-A and 19-D) in the client edit package.
