/**
 * N/format mock - NetSuite Format Module
 * @see https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4388823498.html
 */

module.exports = {
  Type: {
    CCEXPDATE: 'ccexpdate',
    CCNUMBER: 'ccnumber',
    CCVALIDFROM: 'ccvalidfrom',
    CHECKBOX: 'checkbox',
    COLORPICKER: 'colorpicker',
    CURRENCY: 'currency',
    CURRENCY2: 'currency2',
    DATE: 'date',
    DATETIME: 'datetime',
    DATETIMETZ: 'datetimetz',
    DOCUMENT: 'document',
    DYNAMICPRECISION: 'dynamicprecision',
    EMAIL: 'email',
    EMAILS: 'emails',
    FLOAT: 'float',
    FULLPHONE: 'fullphone',
    FUNCTION: 'function',
    FURIGANA: 'furigana',
    IDENTIFIER: 'identifier',
    INTEGER: 'integer',
    MMYYDATE: 'mmyydate',
    MULTISELECT: 'multiselect',
    NONNEGCURRENCY: 'nonnegcurrency',
    NONNEGFLOAT: 'nonnegfloat',
    PACKAGE: 'package',
    PERCENT: 'percent',
    PHONE: 'phone',
    POSCURRENCY: 'poscurrency',
    POSFLOAT: 'posfloat',
    POSINTEGER: 'posinteger',
    RATE: 'rate',
    RATEHIGHPRECISION: 'ratehighprecision',
    SELECT: 'select',
    TEXT: 'text',
    TEXTAREA: 'textarea',
    TIME: 'time',
    TIMEOFDAY: 'timeofday',
    TIMETRACK: 'timetrack',
    URL: 'url',
  },

  Timezone: {
    AFRICA_CAIRO: 'Africa/Cairo',
    AFRICA_JOHANNESBURG: 'Africa/Johannesburg',
    AMERICA_CHICAGO: 'America/Chicago',
    AMERICA_DENVER: 'America/Denver',
    AMERICA_LOS_ANGELES: 'America/Los_Angeles',
    AMERICA_NEW_YORK: 'America/New_York',
    AMERICA_PHOENIX: 'America/Phoenix',
    AMERICA_SAO_PAULO: 'America/Sao_Paulo',
    ASIA_BANGKOK: 'Asia/Bangkok',
    ASIA_DUBAI: 'Asia/Dubai',
    ASIA_HONG_KONG: 'Asia/Hong_Kong',
    ASIA_KOLKATA: 'Asia/Kolkata',
    ASIA_MANILA: 'Asia/Manila',
    ASIA_RIYADH: 'Asia/Riyadh',
    ASIA_SHANGHAI: 'Asia/Shanghai',
    ASIA_SINGAPORE: 'Asia/Singapore',
    ASIA_TOKYO: 'Asia/Tokyo',
    AUSTRALIA_SYDNEY: 'Australia/Sydney',
    ETC_GMT_PLUS_12: 'Etc/GMT+12',
    EUROPE_BERLIN: 'Europe/Berlin',
    EUROPE_LONDON: 'Europe/London',
    EUROPE_PARIS: 'Europe/Paris',
    PACIFIC_AUCKLAND: 'Pacific/Auckland',
    PACIFIC_HONOLULU: 'Pacific/Honolulu',
    US_EASTERN: 'US/Eastern',
    US_PACIFIC: 'US/Pacific',
  },

  parse: jest.fn((options) => {
    const { value, type, timezone } = options;
    if (value == null) return null;

    switch (type) {
      case 'date':
      case 'datetime':
      case 'datetimetz':
        return new Date(value);
      case 'integer':
      case 'posinteger':
        return parseInt(value, 10);
      case 'float':
      case 'posfloat':
      case 'nonnegfloat':
      case 'currency':
      case 'currency2':
      case 'percent':
      case 'rate':
        return parseFloat(value);
      case 'checkbox':
        return value === 'T' || value === true;
      default:
        return value;
    }
  }),

  format: jest.fn((options) => {
    const { value, type, timezone } = options;
    if (value == null) return '';

    switch (type) {
      case 'date':
        return value instanceof Date ? value.toLocaleDateString() : String(value);
      case 'datetime':
      case 'datetimetz':
        return value instanceof Date ? value.toLocaleString() : String(value);
      case 'time':
        return value instanceof Date ? value.toLocaleTimeString() : String(value);
      case 'currency':
      case 'currency2':
        return typeof value === 'number' ? value.toFixed(2) : String(value);
      case 'percent':
        return typeof value === 'number' ? `${value}%` : String(value);
      case 'checkbox':
        return value ? 'T' : 'F';
      default:
        return String(value);
    }
  }),
};