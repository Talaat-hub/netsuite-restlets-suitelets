/**
 * N/file mock - NetSuite File Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4205693274.html
 */

let fileStore = {};
let nextFileId = 1000;

const createFileObject = (options = {}) => {
  const fileId = options.id || nextFileId++;
  const file = {
    id: fileId,
    name: options.name || 'mockfile.txt',
    folder: options.folder || -15,
    fileType: options.fileType || 'PLAINTEXT',
    size: options.size || 0,
    description: options.description || '',
    encoding: options.encoding || 'UTF_8',
    isInactive: options.isInactive || false,
    isOnline: options.isOnline || false,
    path: options.path || `/SuiteScripts/${options.name || 'mockfile.txt'}`,
    url: options.url || '',
    _contents: options.contents || '',

    getContents: jest.fn(function() {
      return this._contents;
    }),

    appendLine: jest.fn(function(options) {
      const value = typeof options === 'string' ? options : options.value;
      this._contents += (this._contents ? '\n' : '') + value;
      return this;
    }),

    resetStream: jest.fn(function() {
      this._streamPosition = 0;
      return this;
    }),

    lines: {
      iterator: jest.fn(function() {
        const lines = file._contents.split('\n');
        let index = 0;
        return {
          each: jest.fn((callback) => {
            while (index < lines.length) {
              const result = callback({ value: lines[index] });
              index++;
              if (result === false) break;
            }
          }),
        };
      }),
    },

    save: jest.fn(function() {
      fileStore[this.id] = { ...this };
      return this.id;
    }),
  };

  return file;
};

module.exports = {
  Type: {
    APPCACHE: 'APPCACHE',
    AUTOCAD: 'AUTOCAD',
    BMPIMAGE: 'BMPIMAGE',
    CONFIG: 'CONFIG',
    CSV: 'CSV',
    EXCEL: 'EXCEL',
    FLASH: 'FLASH',
    FREEMARKER: 'FREEMARKER',
    GIFIMAGE: 'GIFIMAGE',
    GZIP: 'GZIP',
    HTMLDOC: 'HTMLDOC',
    ICON: 'ICON',
    JAVASCRIPT: 'JAVASCRIPT',
    JPGIMAGE: 'JPGIMAGE',
    JSON: 'JSON',
    MESSAGERFC: 'MESSAGERFC',
    MP3: 'MP3',
    MPEGMOVIE: 'MPEGMOVIE',
    MSPROJECT: 'MSPROJECT',
    PDF: 'PDF',
    PJPGIMAGE: 'PJPGIMAGE',
    PLAINTEXT: 'PLAINTEXT',
    PNGIMAGE: 'PNGIMAGE',
    POSTSCRIPT: 'POSTSCRIPT',
    POWERPOINT: 'POWERPOINT',
    QUICKTIME: 'QUICKTIME',
    RTF: 'RTF',
    SCSS: 'SCSS',
    SMS: 'SMS',
    STYLESHEET: 'STYLESHEET',
    SVG: 'SVG',
    TAR: 'TAR',
    TIFFIMAGE: 'TIFFIMAGE',
    VISIO: 'VISIO',
    WEBAPPPAGE: 'WEBAPPPAGE',
    WEBAPPSCRIPT: 'WEBAPPSCRIPT',
    WORD: 'WORD',
    XMLDOC: 'XMLDOC',
    XSD: 'XSD',
    ZIP: 'ZIP',
  },

  Encoding: {
    UTF_8: 'UTF_8',
    WINDOWS_1252: 'WINDOWS_1252',
    ISO_8859_1: 'ISO_8859_1',
    GB18030: 'GB18030',
    SHIFT_JIS: 'SHIFT_JIS',
    MAC_ROMAN: 'MAC_ROMAN',
    GB2312: 'GB2312',
    BIG5: 'BIG5',
  },

  create: jest.fn((options) => createFileObject(options)),

  load: jest.fn((options) => {
    const id = typeof options === 'object' ? options.id : options;
    if (fileStore[id]) {
      return createFileObject(fileStore[id]);
    }
    // Return a default mock file
    return createFileObject({ id, name: `file_${id}.txt` });
  }),

  delete: jest.fn((options) => {
    const id = typeof options === 'object' ? options.id : options;
    delete fileStore[id];
    return true;
  }),

  copy: jest.fn((options) => {
    const { id, folder, conflictResolution } = options;
    const original = fileStore[id] || {};
    const newFile = createFileObject({
      ...original,
      id: nextFileId++,
      folder,
    });
    fileStore[newFile.id] = newFile;
    return newFile;
  }),

  // 🔧 Test helpers
  __setFile: (id, fileData) => {
    fileStore[id] = createFileObject({ id, ...fileData });
  },

  __setFileContents: (id, contents) => {
    if (!fileStore[id]) fileStore[id] = { id };
    fileStore[id].contents = contents;
    fileStore[id]._contents = contents;
  },

  __getFile: (id) => fileStore[id],

  __getState: () => JSON.parse(JSON.stringify(fileStore)),

  __reset: () => {
    fileStore = {};
    nextFileId = 1000;
    jest.clearAllMocks();
  },
};
