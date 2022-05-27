# A minimal approach to automatic, manual and persistent dark mode for websites

Since the day mobil OS started to let the user choose their default theme. Dark mode functionality for websites is getting more and more popular. There are many ways to implement it:

* automatic: just via CSS. Even with JS disabled
* manually: overriding users default color using a button
* persistent: remembers it for next visit


Many code examples I found on the net just accomplish two out of the three. I am going to present a clean and minimal way to achieve all three features at once.

## CSS

Put this in `<head>` section of your document:

```
<style>
:root,
:root.light {
    --bgcolor: white;
    --fontcolor: black;
}
@media (prefers-color-scheme: dark) {
    :root {
        --bgcolor: black;
        --fontcolor: white;
    }
}
:root.dark {
    --bgcolor: black;
    --fontcolor: white;
}
body {
    color: var(--fontcolor);
    background-color: var(--bgcolor);
}
</style>
```

Yes, using CSS Variables since IE11 should be a no-brainer in 2022 anyway. And you will realize Code is not DRY, because of the repeated dark color information. While this is miserably, it is necessary.

## JS

Because we want no flashing background if color changes on page load, inlining this code snippet right before `<body>` is the way to go:

```
<script>
function toggleDarkMode(useDark) {
    if (useDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    }
    else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
}
let useDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (!useDark && localStorage.getItem('dark-mode') === 'true') {
    useDark = true;
    toggleDarkMode(useDark);
}
else if (localStorage.getItem('dark-mode') === 'false') {
    useDark = false;
    toggleDarkMode(useDark);
}
</script>
```

If you find a way to optimize this^, write me please :)

```
<button>Toggle dark/light mode</button>
```

Just a single button, somewhere on the page.

```
<script>
document.querySelector('button').onclick = function() {
    useDark = !useDark;
    toggleDarkMode(useDark);
    localStorage.setItem('dark-mode', useDark);
}
</script>
```

Well, thats the `onclick` handler for our `<button>`. It inverts the current mode, toggles it and saves it in localStorage.

Welcome to the Dark Side. Happy implementing! :)
