# How to skip loading polyfills in modern browsers

Say, you want to continue supporting legacy browsers like IE11 for your customers. Well sure, you have your reasons. In order to do that, you use (most likely) any kind of polyfills which enable modern web features.

Previously, you had something like this before `</body>`:

```
<script defer src="/path/to/polyfills.js">
<script defer src="/path/to/app.js">
```

Both scripts are loaded and executed in every browser. But you don't want to fetch those polyfills in modern browsers in the first place and save precious bytes. Here's how to do it:

```
<script nomodule src="/path/to/polyfills.js">
<script defer src="/path/to/app.js">
```

Legacy browser won't recognize `nomodule` and load the polyfills as always. On the contrary, browsers which support ES2015 modules will skip them. Isn't this awesome?

Source: [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-nomodule)
