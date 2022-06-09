# How content-visibility vastly improved page rendering time for Shoogle

Using modern `content-visibility` [CSS property](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) I've managed to reduce Rendering time to factor 10 for Shoogle. Here's how I achieved that.

## Test first

In Chrom* Dev Tools under `Performance` you can test your page load performance. Besides `Rendering`, there is `Loading`, `Scripting` and `Painting`. Especially for pages with a large and/or complex DOM, improving `Rendering` time is key for fast inital load. Simply measure your pages to see whether any optimization can be worth it.

## CSS to the rescue

In former times we used alot of JavaScript for different things. Today, there are other techniques like `loading="lazy"` available which are built right in the browser. No need to write extra code, time to make the shit lightweight! This has several benefits as outlined already in [another post on this website](/how-to-optimize-websites-for-performance).

So what does `content-visibility`? Basically, you can hide a specific sub-tree with it, but in contrast to `display: none` it still remains in the DOM. So any future showing of the content inside will be much faster. Awesome, let's try it!

## The Shoogle way

Shoogle has many large lists, especially for cities with 1000+ shops, like [Berlin](https://de.shoogle.net/brandenburg/berlin/). This is a pain for the browser on inital load. So I tried to hide those extra content which is not shown in the viewport on page load anyway.

I've splitted up the content into two separate columns:

```html
<div class="wrapper">
    <div class="columns">
        a fixed amount of items, depending on your content
    </div>
    <div class="columns hidden">
        all the remaining items, which are not shown anyway
    </div>
</div>
```

```css
.wrapper {
    height: 256px; // show only a portion of all items
    overflow-y: auto; // rest overflows
}
.columns {
    display: grid; // or any other layout you like
}
.hidden {
    content-visibility: hidden;
}
```

With those little changes we already achieved alot when you check out your initial page load. Now we have to toggle `.hidden` class with JavaScript in order to show those remaining items. Do this on scroll or any other action which could make those additional items visible.

## No polyfill necessary

Too bad, this latest-edge feature is missing support for Firefox and Safari at the time of writing. But you can implement it right away, because it won't break things for those browsers. They will simply ignore this new CSS property and render things as normal.

## Conclusion

I was overwhelmed by the impact of `content-visibility` on Shoogle and hope it will become a web standard soon. It should be our responsibility as web developers to keep things simple, fast and secure.

Thanks for reading and happy developing! :)
