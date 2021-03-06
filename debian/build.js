/* This file is based on build/tasks/build.js
 */
({
  baseUrl: "src",
  name: "jquery",
  out: "dist/jquery.js",
  // We have multiple minify steps
  optimize: "none",
  // Include dependencies loaded with require
  findNestedDependencies: true,
  // Avoid breaking semicolons inserted by r.js
  skipSemiColonInsertion: true,
  wrap: {
    startFile: "start.js",
    endFile: "end.js"
  },
  paths: {
    sizzle: "../external/sizzle/dist/sizzle"
  },
  rawText: {},
  /**
   * Strip all definitions generated by requirejs
   * Convert "var" modules to var declarations
   * "var module" means the module only contains a return statement that should be converted to a var declaration
   * This is indicated by including the file in any "var" folder
   * @param {String} name
   * @param {String} path
   * @param {String} contents The contents to be written (including their AMD wrappers)
   */
  onBuildWrite: function( name, path, contents ) {
    var rdefineEnd = /\}\s*?\);[^}\w]*$/;
    var amdName;
    // Convert var modules
    if ( /.\/var\//.test( path ) ) {
      contents = contents
        .replace( /define\([\w\W]*?return/, "var " + (/var\/([\w-]+)/.exec(name)[1]) + " =" )
        .replace( rdefineEnd, "" );
    // Sizzle treatment
    } else if ( /\/sizzle$/.test( name ) ) {
      contents = "var Sizzle =\n" + contents
        // Remove EXPOSE lines from Sizzle
        .replace( /\/\/\s*EXPOSE[\w\W]*\/\/\s*EXPOSE/, "return Sizzle;" );

    } else {
      contents = contents
        .replace( /\s*return\s+[^\}]+(\}\s*?\);[^\w\}]*)$/, "$1" )


      // Ignore jQuery's exports (the only necessary one)
      if ( name !== "jquery" ) {
        contents = contents
          .replace( /\s*return\s+[^\}]+(\}\);[^\w\}]*)$/, "$1" )
          // Multiple exports
          .replace( /\s*exports\.\w+\s*=\s*\w+;/g, "" );
      } else {
        contents = contents.replace(/return.*;/, '');
      }

      // Remove define wrappers, closure ends, and empty declarations
      contents = contents
        .replace( /define\([^{]*?{\s*(?:("|')use strict\1(?:;|))?/, "" )
          .replace( rdefineEnd, "" );

          // Remove anything wrapped with
          // /* ExcludeStart */ /* ExcludeEnd */
          // or a single line directly after a // BuildExclude comment
          contents = contents
            .replace( /\/\*\s*ExcludeStart\s*\*\/[\w\W]*?\/\*\s*ExcludeEnd\s*\*\//ig, "" )
            .replace( /\/\/\s*BuildExclude\n\r?[\w\W]*?\n\r?/ig, "" );

          // Remove empty definitions
          contents = contents
            .replace( /define\(\[[^\]]+\]\)[\W\n]+$/, "" );
    }
    return contents;
  }
})

