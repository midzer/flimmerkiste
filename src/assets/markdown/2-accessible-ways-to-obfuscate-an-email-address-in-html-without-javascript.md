# 2 accessible ways to obfuscate an email address in HTML without JavaScript

As you might know, malicious crawlers are around in the web to gather sensitive information like email addresses. Same as bad companies selling your private data, you might get SPAM in your inbox once this happens. For the latter you can't do much against it, except not trusting dubious "free" services at all. 

But you can try to obfuscate valueable content on your website. In this blog post I show you two accessible ways without any JavaScript coding involved:

## The simple one

Let's start easy. As crawlers don't understand CSS, simply add a `hidden` `span` element with some random content to the email:

```html
info@<span hidden>.nospan</span>@example.com
```

It's working quite good. Crawlers are apparently too stupid to parse this disguise.

## The harder one

This approach has the benefit of allowing clickable `mailto` links. In addition we make use of CSS variables, which might look a little bit hacky:

```html
<style>
:root { --mydom: "example.com"; }
.at:before { content: "@"; }
.dom:after { content: var(--mydom); }
</style>
<a href="mailto:i%6efo@example%2ecom">
    info
    <span class="at"></span>
    <span class="dom"></span>
</a>
```
