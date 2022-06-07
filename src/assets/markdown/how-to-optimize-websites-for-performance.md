# How to optimize websites for performance

![Header Loading](assets/images/loading.png)

Mobile bandwidth is limited in many places. Sites may take ages to load on 3G. I’m going to explain ways to vastly improve performance.

I think everyone has experienced slowly loading websites on 3G once in a while. Surfing experience might feel uncomfortable comparing to using stable LAN/WiFi connections. There are studies around showing over 50% of users are tempted to abort loading process of a website in case requested URL doesn’t show up within ~3 seconds.

As a web developer you want to ensure users enjoy your page’s visit. Besides appealing design, consistent accessability and awesome content improving your site’s general performance is an important column in web development.

Miserably, many sites lack in terms of speed. Just remember those people not living in an area where 5G is standard or owning latest iPhone ;)

Well, we can do something about it! Let’s talk about some essential terms first of all.

## Page processing

Uff, this is a tough one. No, we don’t want to go into detail here about what your browser is actually doing when someone visits your site for the first time :)

Let me focus on three essential points of time any page load can be destinguished into:

* First meaningful paint: point of time when first (layouted) content is presented to the user in the viewport

* First interactive: Site is ready for input, but maybe some JavaScript is running which might hog devices CPU and result in a laggy scrolling experience

* Fully interactive: All JavaScript calculations are done

Basically we want to reduce all three of them. But how to achieve that? Every website is different. Where are issues on my page?

## Discover bottlenecks

In 2017 there are some easy ways to find out where your static page has issues. I recommend auditing with Chromium extension [Lighthouse](https://chrome.google.com/webstore/detail/lighthouse/blipmdconlkpinefehnmjammfjpmpbjk). Since Chromium v61 this tool is directly integrated in Developer Console (Audit tab).

Below I want to point out three methods which affect your site’s performance above all. I learned them while trying to get a better Lighthouse score in my web projects.

## Lazy Loading

Many websites introduce pages with lots of bytes going down the pipe. Why not save kBfor content which might not be reached by the user at all? In addition, users can interact with your page far sooner because all heavy elements below-the-fold will be fetched from the network just before user actually needs them, i.e. enter the viewport.

You can massively reduce time for your page to be fully interactive by lazy loading any images, videos, iframes or other components which depend on indivual, capsulated (heavy) JavaScript.

Sure, lazy loading exists for many years. There are many libraries implementing this feature by observing elements in question via Scroll Event Listener. To bad this approach might result in a laggy user experience while scrolling down on page load especially using devices with mediocre CPU like any mobile devices.

I’m glad browser developers did something about it: friendly welcome **IntersectionObserver**, your next best friend :)

In late 2017 there are libraries out there which use IntersectionObserver for good. I recommend checking out [Lozad.js](https://github.com/ApoorvSaxena/lozad.js).

Leightweight sites are good in general. You will be astonished how much your [site costs](https://whatdoesmysitecost.com/) for mobile users around the world.

Okay, we managed to reduce our total amoint of data to ship by lazy loading it “On Demand”. What else we can do squeeze out more tempo?

Many developers put their JavaScript right before </body> because they don’t want to cause any render blocking and delay page load therefor. Sure, this is the way to go. In addition you can defer them, too. Would’nt it be great to have your (potentially heavy) JavaScript already loaded before browser processes it at the bottom of your page?

Yeah, with modern browsers we can do that natively using Preload directive to tell the browser it should start loading additional resources like Scripts right away.

## Control resource priorities

Sure, browser are pretty smart today on their own. In many cases they do a good job in asuming download priority of each file type to be fetched after initial index.html is being evaluated.

But I think humans can do better! Now we can fine tune resource control of (almost) any extra loaded resources by using modern <link> attributes preload and prefetch.

Save precious time and begin loading important resources in <head> immediately without render-blocking your page’s loading process. That’s awesome, isn’t it? Phew, cool stuff. But as always, given great powers expects you to use them in a desired manner to work as expected.

Using **Preload** your browser delivers absolute essential resources with increased priority. Beware that your browser doesn’t keep them in cache if you use them right after page is loaded, so don’t preload everything ;)

    <link rel=”preload” href=”/assets/js/main.js” as=”script”>

Further use cases:

* (bundled) main.cssin conjunction with **Crititcal CSS** explained below

* any heavy web-font

On the other hand **Prefetch** serves as a good choice for resources which might not be used by the user at all. Those files are fetched with very low priority, but are kept in your browser cache.

    <link rel=”prefetch” href=”/data.json”>

For more insight check out this [awesome post](https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf) by [Addy Osmani](undefined).

## Critical CSS

When you remove any render-blocking css using preload, your page is shown as soon as possible. On the on hand this is awesome because your HTML is parsed without any delay saving precious time. But hey, what about my layout? For large sites you will experience a sudden change in layout when your CSS is finished loading and evaluated by your browser. In order to prevent this annoying Critical CSS comes into play:

You should inline any page-specific CSS directly in HTML which is necessary to render any above-the-fold content (desktop and mobile) properly.

Extracting those styles on your own can be very time consuming. I’m happy that there are solutions out there which do the job superb: Hello [critical](https://github.com/addyosmani/critical) :)

## Demonstration

For two years I’m working on a [website](https://feuerwehr-eisolzried.de/) for my local fire fighter department. During that period I learned many techniques summarized in this post from great people on the web. Incase you want to jump in the code directly, check out the [repo](https://github.com/midzer/eisolzried).

## Boilerplate

For new projects using Jekyll/Gulp combo, [Max Böck](undefined) built a clean, basic [starter package](https://github.com/maxboeck/jekyll-gulp).

## Conclusion

Following tips may speed up your website to a great extend:

* **Lazy loading**

* **Preload/Prefetch**

* **Critical CSS**

Further aspects not explained in this post are workflows to

* **Minimize** your assets

* **Bundle** your resources

* **Avoid heavy libraries** like jQuery

* **Remove unused CSS classes** using preprocessors like SASS

*Reduce to the max!*

I hope this post is useful as a starting point to improve your page in terms of performance. Thanks for reading and have a nice day!
