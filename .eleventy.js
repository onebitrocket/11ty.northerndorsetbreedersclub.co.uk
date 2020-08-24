const fs = require("fs");
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {

  eleventyConfig.setDataDeepMerge(true);

  // minify the html output
  eleventyConfig.addTransform("htmlmin", require("./_src/_utils/minify-html.js"));

  eleventyConfig.addShortcode("currentYear", () => {
    return DateTime.local().toFormat("yyyy");
  });

  const now = new Date();

  const livePosts = p => p.date <= now;

  eleventyConfig.addCollection("blogposts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("**/blog/*.md").filter(livePosts);
  });

  const liveEvents = e => e.startDate >= now;

  console.log(liveEvents);
  eleventyConfig.addCollection("eventposts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("**/events/*.md");
  });

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("DDDD");
  });

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_src/images");
  eleventyConfig.addPassthroughCopy("_src/uploads");
  eleventyConfig.addPassthroughCopy("_src/js");

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  });

  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    // callbacks: {
    //   ready: function(err, browserSync) {
    //     const content_404 = fs.readFileSync('_site/404.html');

    //     browserSync.addMiddleware("*", (req, res) => {
    //       // Provides the 404 content without redirect.
    //       res.writeHead(404);
    //       res.write(content_404);
    //       res.end();
    //     });
    //   }
    // },
    ui: false,
    ghostMode: false
  });

  return {

    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid",
      "11ty.js"
    ],

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: "_src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }

  };

}
