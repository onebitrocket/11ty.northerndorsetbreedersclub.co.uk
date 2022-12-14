const fs = require("fs");
const { DateTime } = require("luxon");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const markdownItLinkAttrs = require("markdown-it-link-attributes");
const markdownItResponsive = require("@gerhobbelt/markdown-it-responsive");

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

  const liveEvents = e => e.data.startDate >= now;

  eleventyConfig.addCollection("eventposts", collection => {
    const events = collection.getFilteredByGlob("**/events/*.md")
      .sort((a, b) => {
        return new Date(a.data.startDate) - new Date(b.data.startDate);
      })
      .filter(liveEvents);
    return events;
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
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("_src/images");
  eleventyConfig.addPassthroughCopy("_src/uploads/");
  // eleventyConfig.addPassthroughCopy("_src/**/*.(pdf|doc|docx)");
  eleventyConfig.addPassthroughCopy("_src/js");

  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  })
  .use(markdownItAnchor, {})
  .use(markdownItLinkAttrs, [{
    pattern: /^https?:\/\//,
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer nofollow'
    }
  }]);

  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404);
          res.write(content_404);
          res.end();
        });
      }
    },
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
