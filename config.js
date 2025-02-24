// TODO These code bits don't really belong here, but this is the only
// shared bit of js

function tabulate(list) {
  var result = '';
  $.each(list, function (index) {
    if (this.length == 2) {
      if (this[1].length)
        result += "   " + this[0] + ": " + this[1] + "\n";
    } else {
      result += "   " + this + "\n";
    }
  });
  return result;
}


String.prototype.escapeHtml = function () {
  return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}


function template(tmpl, data) {
  var brag = tmpl.replace(/\$([_A-Za-z.]+)/g, function (str, p1) {
    var dict = data;
    $.each(p1.split("."), function (i,v) {
      if (!dict) return true;
      if (v == "___") {
        dict = tabulate(dict);
      } else {
        dict = dict[v.replace("_"," ")];
        if (typeof dict == typeof "")
          dict = dict.escapeHtml();
      }
      return null;
    });
    if (dict === undefined) dict = '';
    return dict;
  });
  return brag;
}

// From http://baagoe.com/en/RandomMusings/javascript/
  // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = data.toString();
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  mash.version = 'Mash 0.9';
  return mash;
}


// From http://baagoe.com/en/RandomMusings/javascript/
function Alea() {
  return (function(args) {
    // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
    var s0 = 0;
    var s1 = 0;
    var s2 = 0;
    var c = 1;

    if (!args.length) {
      args = [+new Date];
    }
    var mash = Mash();
    s0 = mash(' ');
    s1 = mash(' ');
    s2 = mash(' ');

    for (var i = 0; i < args.length; i++) {
      s0 -= mash(args[i]);
      if (s0 < 0) {
        s0 += 1;
      }
      s1 -= mash(args[i]);
      if (s1 < 0) {
        s1 += 1;
      }
      s2 -= mash(args[i]);
      if (s2 < 0) {
        s2 += 1;
      }
    }
    mash = null;

    var random = function() {
      var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
      s0 = s1;
      s1 = s2;
      return s2 = t - (c = t | 0);
    };
    random.uint32 = function() {
      return random() * 0x100000000; // 2^32
    };
    random.fract53 = function() {
      return random() +
        (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
    };
    random.version = 'Alea 0.9';
    random.args = args;
    random.state = function (newstate) {
      if (newstate) {
        s0 = newstate[0];
        s1 = newstate[1];
        s2 = newstate[2];
        c = newstate[3];
      }
      return [s0,s1,s2,c];
    };
    return random;

  } (Array.prototype.slice.call(arguments)));
}


var seed = new Alea();

function Random(n) {
  return seed.uint32() % n;
}


function randseed(set) {
  return seed.state(set);
}


function Pick(a) {
  return a[Random(a.length)];
}


var KParts = [
  'br|cr|dr|fr|gr|j|kr|l|m|n|pr||||r|sh|tr|v|wh|x|y|z'.split('|'),
  'a|a|e|e|i|i|o|o|u|u|ae|ie|oo|ou'.split('|'),
  'b|ck|d|g|k|m|n|p|t|v|x|z'.split('|')];

function GenerateName() {
  var result = '';
  for (var i = 0; i <= 5; ++i)
    result += Pick(KParts[i % 3]);
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Prefixes (charPrefixesSets)
// These are the starting elements, often suggesting personality traits, titles, or evocative imagery.
// Define multiple sets of name parts for increased randomness

// Focuses on heroic and mystical themes (brave, shadow, flame).
var charPrefixesSet1 = [
  'Brave', 'Shadow', 'Flame', 'Azer', 'El', 'Thal', 'Dun', 'Fal', 'Gor', 'Hel', 
  'Dusk', 'Dawn', 'Tide', 'Wave', 'Frost', 'Ash', 'Oak', 'Pine', 'Hawk', 'Storm'
];

// Adds a mystical or rugged feel (mist, rift, rune).
var charPrefixesSet2 = [
  'Kar', 'Lor', 'Nor', 'Quel', 'Sil', 'Tal', 'Val', 'Zul', 'Bast', 'Eld', 
  'Mist', 'Shade', 'Glim', 'Rift', 'Crag', 'Peak', 'Soot', 'Coal', 'Jade', 'Rune'
];

// Emphasizes colors and metals, common in fantasy naming.
var charPrefixesSet3 = [
  'Bright', 'Dark', 'Frost', 'Shadow', 'Iron', 'Gold', 'Silver', 'Bronze', 'Sun', 'Moon', 
  'Star', 'Sky', 'Red', 'Blue', 'Green', 'White', 'Black', 'Stone', 'Wind', 'Thunder'
];
var charPrefixesSets = [charPrefixesSet1, charPrefixesSet2, charPrefixesSet3];

// Middles (charMiddlesSets)
// These connect prefixes and suffixes, adding rhythm and flavor.

// Short, flowing sounds for a light touch (e.g., "en", "wyn").
var charMiddlesSet1 = [
  'en', 'or', 'ar', 'ir', 'ur', 'an', 'in', 'on', 'un', 'el', 
  'ys', 'eth', 'wyn', 'ra', 'la', 'ma', 'na', 'si', 'ti', 'vo'
];

// Slightly sharper or melodic connectors (e.g., "il", "ai").
var charMiddlesSet2 = [
  'il', 'ol', 'ul', 'al', 'er', 'ath', 'eth', 'ith', 'oth', 'uth', 
  'es', 'is', 'os', 'us', 'ai', 'ei', 'oi', 'ui', 'ka', 'ta'
];

// Longer, grounded endings (e.g., "and", "ern").
var charMiddlesSet3 = [
  'and', 'end', 'ind', 'ond', 'und', 'ald', 'eld', 'ild', 'old', 'uld', 
  'ern', 'orn', 'irn', 'urn', 'ant', 'ent', 'int', 'ont', 'unt', 'ard'
];
var charMiddlesSets = [charMiddlesSet1, charMiddlesSet2, charMiddlesSet3];

// Suffixes (charSuffixesSets)
// These are the endings, often denoting titles or traits.

// Mix of titles and serene traits (e.g., "the Brave", "the Wise").
var charSuffixesSet1 = [
  'the Brave', 'the Wise', 'the Bold', 'the Swift', 'the Strong', 'the Just', 'the Kind', 'the Fierce', 'the Noble', 'the Valiant', 
  'the Gentle', 'the Mighty', 'the Fearless', 'the Loyal', 'the Protector', 'the Guardian', 'the Seeker', 'the Wanderer', 'the Sage', 'the Healer'
];

// Defensive or rugged features (e.g., "the Defender", "the Stalwart").
var charSuffixesSet2 = [
  'the Defender', 'the Stalwart', 'the Shield', 'the Sentinel', 'the Watcher', 'the Keeper', 'the Protector', 'the Guardian', 'the Champion', 'the Warrior', 
  'the Hunter', 'the Tracker', 'the Scout', 'the Pathfinder', 'the Survivor', 'the Resilient', 'the Enduring', 'the Unyielding', 'the Unbroken', 'the Resolute'
];

// Open or mystical traits (e.g., "the Enchanter", "the Mystic").
var charSuffixesSet3 = [
  'the Enchanter', 'the Mystic', 'the Sorcerer', 'the Magician', 'the Illusionist', 'the Seer', 'the Oracle', 'the Visionary', 'the Dreamer', 'the Prophet', 
  'the Alchemist', 'the Shaman', 'the Druid', 'the Elementalist', 'the Conjurer', 'the Warlock', 'the Witch', 'the Wizard', 'the Sage', 'the Healer'
];
var charSuffixesSets = [charSuffixesSet1, charSuffixesSet2, charSuffixesSet3];

// Expanded Culture-Specific Arrays

// Elvish (Graceful, Melodic) Light, flowing, and ethereal.
var elvishCharPrefixes = [
  'El', 'Lor', 'Mor', 'Sil', 'Tel', 'Ael', 'Fae', 'Vyn', 'Lun', 'Syl', 
  'Ere', 'Ith', 'Ara', 'Cele', 'Nim'
];
var elvishCharMiddles = [
  'en', 'ith', 'ar', 'el', 'yn', 'ae', 'ir', 'is', 'ora', 'eth', 
  'ia', 'la', 'ri', 'va', 'me'
];
var elvishCharSuffixes = [
  'dell', 'nor', 'iel', 'wyn', 'thar', 'lith', 'dor', 'viel', 'syl', 'eth', 
  'ara', 'ien', 'mir', 'las', 'ren'
];

// Dwarvish (Harsh, Sturdy) Rough, solid, and industrious
var dwarvishCharPrefixes = [
  'Dun', 'Kar', 'Gor', 'Hel', 'Tor', 'Dru', 'Bar', 'Thrum', 'Kor', 'Gar', 
  'Urk', 'Bor', 'Dwar', 'Grim', 'Ston'
];
var dwarvishCharMiddles = [
  'ad', 'um', 'or', 'ak', 'un', 'od', 'ur', 'ag', 'ol', 'am', 
  'en', 'ir', 'ok', 'ug', 'ud'
];
var dwarvishCharSuffixes = [
  'heim', 'gard', 'gul', 'dorn', 'muk', 'forge', 'hold', 'rock', 'stone', 'deep', 
  'crag', 'delve', 'mine', 'grot', 'holt'
];

// Human (Familiar, Grounded) Earthy and settlement-focused
var humanCharPrefixes = [
  'Bright', 'Dark', 'Frost', 'Shadow', 'North', 'South', 'East', 'West', 'High', 'Low', 
  'Red', 'Green', 'Blue', 'Grey', 'New'
];
var humanCharMiddles = [
  'en', 'ly', 'ton', 'er', 'on', 'ham', 'ing', 'wood', 'land', 'by', 
  'es', 'ow', 'ry', 'st', 'we'
];
var humanCharSuffixes = [
  'shire', 'wood', 'vale', 'ton', 'ford', 'ham', 'ley', 'bridge', 'hill', 'brook', 
  'mead', 'well', 'gate', 'port', 'field'
];


function GenerateNameNew(wordCount = 1, culture = 'mixed') {
// Example usage
//GenerateLocationName();       // Single-word name
//GenerateLocationName(2);      // Two-word name
//GenerateLocationName(3, 'elvish'); // Three-word elvish name
//GenerateLocationName(4, 'dwarvish'); // Four-word dwarvish name

  let prefixes, middles, suffixes;

  // Select arrays based on culture
  if (culture === 'elvish') {
    prefixes = elvishCharPrefixes.filter(isPronounceable);
    middles = elvishCharMiddles.filter(isPronounceable);
    suffixes = elvishCharSuffixes.filter(isPronounceable);
  } else if (culture === 'dwarvish') {
    prefixes = dwarvishCharPrefixes.filter(isPronounceable);
    middles = dwarvishCharMiddles.filter(isPronounceable);
    suffixes = dwarvishCharSuffixes.filter(isPronounceable);
  } else if (culture === 'human') {
    prefixes = humanCharPrefixes.filter(isPronounceable);
    middles = humanCharMiddles.filter(isPronounceable);
    suffixes = humanCharSuffixes.filter(isPronounceable);
  } else {
    prefixes = Pick(locPrefixesFilteredSets);
    middles = Pick(locMiddlesFilteredSets);
    suffixes = Pick(locSuffixesFilteredSets);
  }

  let parts = [];
  let firstLetter = null;

  // Generate parts with variety in structure
  for (let i = 0; i < wordCount; i++) {
    let pattern = Math.floor(Math.random() * 2); // 0: standard, 1: compound (removed descriptive from here)
    let part;

    if (pattern === 0) {
      // Standard: prefix + optional middle + suffix
      part = Pick(prefixes) + (Math.random() < 0.5 ? Pick(middles) : '') + Pick(suffixes);
    } else {
      // Compound: suffix + suffix
      part = Pick(suffixes) + Pick(suffixes);
    }

    part = part.charAt(0).toUpperCase() + part.slice(1);
    if (i === 0) {
      firstLetter = part.charAt(0).toLowerCase();
    }

    // Alliteration: 50% chance to match first letter for subsequent parts
    if (i > 0 && Math.random() < 0.5) {
      let matchingSuffixes = suffixes.filter(s => s.charAt(0).toLowerCase() === firstLetter);
      if (matchingSuffixes.length > 0) {
        part = Pick(prefixes) + (Math.random() < 0.5 ? Pick(middles) : '') + Pick(matchingSuffixes);
        part = part.charAt(0).toUpperCase() + part.slice(1);
      }
    }

    parts.push(part);
  }

  // Join parts with separators
  let result = parts[0];
  let lastSeparator = ' ';

  for (let i = 1; i < parts.length; i++) {
    let prevChar = result.slice(-1);
    let nextChar = parts[i].charAt(0);
    let separator = getSeparator(i === 1, prevChar, nextChar, lastSeparator);
    result += separator + parts[i];
    lastSeparator = separator;
  }

/*  // Optional descriptive element (20% chance, one per name)
  if (Math.random() < 0.2) {
    let descriptor = Pick(descriptors);
    result = descriptor + ' ' + result; // Always add a space after descriptor
  }
*/
  // Cleanup: remove trailing separators or spaces
  return result.replace(/['-\s]+$/, '');
}

/*//-- we have a pick function already...  Is this one better??
// Utility function to pick a random element from an array
function Pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}
*/

// Pronounceability check function
function isPronounceable(part) {
  let vowels = 'aeiou';
  let maxConsonants = 2;
  let maxVowels = 3;
  let consonantCount = 0;
  let vowelCount = 0;

  for (let char of part.toLowerCase()) {
    if (vowels.includes(char)) {
      vowelCount++;
      consonantCount = 0;
      if (vowelCount > maxVowels) return false;
    } else {
      consonantCount++;
      vowelCount = 0;
      if (consonantCount > maxConsonants) return false;
    }
  }
  return true;
}

// Prefixes (locPrefixesSets)
// These are the starting elements, often suggesting natural features, colors, or evocative imagery.
// Define multiple sets of name parts for increased randomness

//Focuses on natural and elemental themes (rivers, dusk, flames).
var locPrefixesSet1 = [
  'Riv', 'Mor', 'Storm', 'Azer', 'El', 'Thal', 'Dun', 'Fal', 'Gor', 'Hel', 
  'Dusk', 'Dawn', 'Tide', 'Wave', 'Frost', 'Flame', 'Ash', 'Oak', 'Pine', 'Hawk'
];

//Adds a mystical or rugged feel (mist, rift, rune).
var locPrefixesSet2 = [
  'Kar', 'Lor', 'Nor', 'Quel', 'Sil', 'Tal', 'Val', 'Zul', 'Bast', 'Eld', 
  'Mist', 'Shade', 'Glim', 'Rift', 'Crag', 'Peak', 'Soot', 'Coal', 'Jade', 'Rune'
];

//Emphasizes colors and metals, common in fantasy naming.
var locPrefixesSet3 = [
  'Bright', 'Dark', 'Frost', 'Shadow', 'Iron', 'Gold', 'Silver', 'Bronze', 'Sun', 'Moon', 
  'Star', 'Sky', 'Red', 'Blue', 'Green', 'White', 'Black', 'Stone', 'Wind', 'Thunder'
];
var locPrefixesSets = [locPrefixesSet1, locPrefixesSet2, locPrefixesSet3];

// Middles (locMiddlesSets)
// These connect prefixes and suffixes, adding rhythm and flavor.

//Short, flowing sounds for a light touch (e.g., "en", "wyn").
var locMiddlesSet1 = [
  'en', 'or', 'ar', 'ir', 'ur', 'an', 'in', 'on', 'un', 'el', 
  'ys', 'eth', 'wyn', 'ra', 'la', 'ma', 'na', 'si', 'ti', 'vo'
];

//Slightly sharper or melodic connectors (e.g., "il", "ai").
var locMiddlesSet2 = [
  'il', 'ol', 'ul', 'al', 'er', 'ath', 'eth', 'ith', 'oth', 'uth', 
  'es', 'is', 'os', 'us', 'ai', 'ei', 'oi', 'ui', 'ka', 'ta'
];

//Longer, grounded endings (e.g., "and", "ern").
var locMiddlesSet3 = [
  'and', 'end', 'ind', 'ond', 'und', 'ald', 'eld', 'ild', 'old', 'uld', 
  'ern', 'orn', 'irn', 'urn', 'ant', 'ent', 'int', 'ont', 'unt', 'ard'
];
var locMiddlesSets = [locMiddlesSet1, locMiddlesSet2, locMiddlesSet3];

// Suffixes (locSuffixesSets)
// These are the endings, often denoting geographic or settlement types.

//Mix of settlements and serene landscapes (e.g., "heim", "lake").
var locSuffixesSet1 = [
  'dell', 'dor', 'wind', 'roth', 'heim', 'gard', 'hold', 'shire', 'wood', 'land', 
  'crown', 'veil', 'mere', 'lake', 'ford', 'hill', 'ridge', 'glen', 'vale', 'moor'
];

//Defensive or rugged features (e.g., "keep", "crag").
var locSuffixesSet2 = [
  'mere', 'vale', 'hollow', 'keep', 'fort', 'gate', 'peak', 'stone', 'watch', 'cliff', 
  'crag', 'bluff', 'pass', 'reach', 'run', 'spring', 'brook', 'fen', 'marsh', 'grove'
];

//Open or coastal areas (e.g., "bay", "steppe").
var locSuffixesSet3 = [
  'ridge', 'field', 'grove', 'haven', 'march', 'pass', 'reach', 'rest', 'rock', 'run', 
  'bay', 'cove', 'isle', 'point', 'sand', 'dune', 'plain', 'mead', 'steppe', 'rift'
];
var locSuffixesSets = [locSuffixesSet1, locSuffixesSet2, locSuffixesSet3];

// Expanded Culture-Specific Arrays

// Elvish (Graceful, Melodic) Light, flowing, and ethereal.
var elvishPrefixes = [
  'El', 'Lor', 'Mor', 'Sil', 'Tel', 'Ael', 'Fae', 'Vyn', 'Lun', 'Syl', 
  'Ere', 'Ith', 'Ara', 'Cele', 'Nim'
];
var elvishMiddles = [
  'en', 'ith', 'ar', 'el', 'yn', 'ae', 'ir', 'is', 'ora', 'eth', 
  'ia', 'la', 'ri', 'va', 'me'
];
var elvishSuffixes = [
  'dell', 'nor', 'iel', 'wyn', 'thar', 'lith', 'dor', 'viel', 'syl', 'eth', 
  'ara', 'ien', 'mir', 'las', 'ren'
];

// Dwarvish (Harsh, Sturdy) Rough, solid, and industrious
var dwarvishPrefixes = [
  'Dun', 'Kar', 'Gor', 'Hel', 'Tor', 'Dru', 'Bar', 'Thrum', 'Kor', 'Gar', 
  'Urk', 'Bor', 'Dwar', 'Grim', 'Ston'
];
var dwarvishMiddles = [
  'ad', 'um', 'or', 'ak', 'un', 'od', 'ur', 'ag', 'ol', 'am', 
  'en', 'ir', 'ok', 'ug', 'ud'
];
var dwarvishSuffixes = [
  'heim', 'gard', 'gul', 'dorn', 'muk', 'forge', 'hold', 'rock', 'stone', 'deep', 
  'crag', 'delve', 'mine', 'grot', 'holt'
];

// Human (Familiar, Grounded) Earthy and settlement-focused
var humanPrefixes = [
  'Bright', 'Dark', 'Frost', 'Shadow', 'North', 'South', 'East', 'West', 'High', 'Low', 
  'Red', 'Green', 'Blue', 'Grey', 'New'
];
var humanMiddles = [
  'en', 'ly', 'ton', 'er', 'on', 'ham', 'ing', 'wood', 'land', 'by', 
  'es', 'ow', 'ry', 'st', 'we'
];
var humanSuffixes = [
  'shire', 'wood', 'vale', 'ton', 'ford', 'ham', 'ley', 'bridge', 'hill', 'brook', 
  'mead', 'well', 'gate', 'port', 'field'
];

// Filter arrays for pronounceability
var locPrefixesFilteredSets = locPrefixesSets.map(set => set.filter(isPronounceable));
var locMiddlesFilteredSets = locMiddlesSets.map(set => set.filter(isPronounceable));
var locSuffixesFilteredSets = locSuffixesSets.map(set => set.filter(isPronounceable));

// Descriptors for descriptive elements
var descriptors = ['Great', 'Lost', 'Forbidden', 'Ancient', 'Mystic', 'Sacred'];

// Generates a fantasy location name
function GenerateLocationName(wordCount = 1, culture = 'mixed') {
// Example usage
//GenerateLocationName();       // Single-word name
//GenerateLocationName(2);      // Two-word name
//GenerateLocationName(3, 'elvish'); // Three-word elvish name
//GenerateLocationName(4, 'dwarvish'); // Four-word dwarvish name

  let prefixes, middles, suffixes;

  // Select arrays based on culture
  if (culture === 'elvish') {
    prefixes = elvishPrefixes.filter(isPronounceable);
    middles = elvishMiddles.filter(isPronounceable);
    suffixes = elvishSuffixes.filter(isPronounceable);
  } else if (culture === 'dwarvish') {
    prefixes = dwarvishPrefixes.filter(isPronounceable);
    middles = dwarvishMiddles.filter(isPronounceable);
    suffixes = dwarvishSuffixes.filter(isPronounceable);
  } else if (culture === 'human') {
    prefixes = humanPrefixes.filter(isPronounceable);
    middles = humanMiddles.filter(isPronounceable);
    suffixes = humanSuffixes.filter(isPronounceable);
  } else {
    prefixes = Pick(locPrefixesFilteredSets);
    middles = Pick(locMiddlesFilteredSets);
    suffixes = Pick(locSuffixesFilteredSets);
  }

  let parts = [];
  let firstLetter = null;

  // Generate parts with variety in structure
  for (let i = 0; i < wordCount; i++) {
    let pattern = Math.floor(Math.random() * 2); // 0: standard, 1: compound (removed descriptive from here)
    let part;

    if (pattern === 0) {
      // Standard: prefix + optional middle + suffix
      part = Pick(prefixes) + (Math.random() < 0.5 ? Pick(middles) : '') + Pick(suffixes);
    } else {
      // Compound: suffix + suffix
      part = Pick(suffixes) + Pick(suffixes);
    }

    part = part.charAt(0).toUpperCase() + part.slice(1);
    if (i === 0) {
      firstLetter = part.charAt(0).toLowerCase();
    }

    // Alliteration: 50% chance to match first letter for subsequent parts
    if (i > 0 && Math.random() < 0.5) {
      let matchingSuffixes = suffixes.filter(s => s.charAt(0).toLowerCase() === firstLetter);
      if (matchingSuffixes.length > 0) {
        part = Pick(prefixes) + (Math.random() < 0.5 ? Pick(middles) : '') + Pick(matchingSuffixes);
        part = part.charAt(0).toUpperCase() + part.slice(1);
      }
    }

    parts.push(part);
  }

  // Join parts with separators
  let result = parts[0];
  let lastSeparator = ' ';

  for (let i = 1; i < parts.length; i++) {
    let prevChar = result.slice(-1);
    let nextChar = parts[i].charAt(0);
    let separator = getSeparator(i === 1, prevChar, nextChar, lastSeparator);
    result += separator + parts[i];
    lastSeparator = separator;
  }

  // Optional descriptive element (20% chance, one per name)
  if (Math.random() < 0.2) {
    let descriptor = Pick(descriptors);
    result = descriptor + ' ' + result; // Always add a space after descriptor
  }

  // Cleanup: remove trailing separators or spaces
  return result.replace(/['-\s]+$/, '');
}

// Determines the separator to use between words
function getSeparator(isFirstTwoWords = false, prevChar = '', nextChar = '', lastSeparator = '') {
  let separators = [' ', '\'', '-'];
  let weights = isFirstTwoWords ? [0.8, 0.2, 0] : [0.7, 0.15, 0.15];

  // If the last separator was not a space, force a space
  if (lastSeparator !== ' ') {
    weights = [1, 0, 0];
  }

  // Choose separator based on weights
  let rand = Math.random();
  let cumulative = 0;
  let chosenSeparator = ' ';

  for (let i = 0; i < separators.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) {
      chosenSeparator = separators[i];
      break;
    }
  }

  // Ensure apostrophe is followed by a letter
  if (chosenSeparator === '\'' && (!nextChar || !/[a-z]/i.test(nextChar))) {
    chosenSeparator = ' ';
  }

  return chosenSeparator;
}


function LocalStorage() {
  this.getItem = function (key, callback) {
    var result = window.localStorage.getItem(key);
    if (callback)
      callback(result);
  };

  this.setItem = function (key, value, callback) {
    window.localStorage.setItem(key, value);
    if (callback)
      callback();
  };

  this.removeItem = function (key) {
    window.localStorage.removeItem(key);
  };
}


function CookieStorage() {
  this.getItem = function(key, callback) {
    var result;
    $.each(document.cookie.split(";"), function (i,cook) {
      if (cook.split("=")[0] === key)
        result = unescape(cook.split("=")[1]);
    });
    if (callback)
      setTimeout(function () { callback(result); }, 0);
    return result;
  };

  this.setItem = function (key, value, callback) {
    document.cookie = key + "=" + escape(value);
    if (callback)
      setTimeout(callback, 0);
  };

  this.removeItem = function (key) {
    document.cookie = key + "=; expires=Thu, 01-Jan-70 00:00:01 GMT;";
  };
}

function SqlStorage() {
  this.async = true;

  this.db = window.openDatabase("pq", "", "Progress Quest", 2500);

  this.db.transaction(function(tx) {
    tx.executeSql("CREATE TABLE IF NOT EXISTS Storage(key TEXT UNIQUE, value TEXT)");
  });

  this.getItem = function(key, callback) {
    this.db.transaction(function (tx) {
      tx.executeSql("SELECT value FROM Storage WHERE key=?", [key], function(tx, rs) {
        if (rs.rows.length)
          callback(rs.rows.item(0).value);
        else
          callback();
      });
    });
  };

  this.setItem = function (key, value, callback) {
    this.db.transaction(function (tx) {
      tx.executeSql("INSERT OR REPLACE INTO Storage (key,value) VALUES (?,?)",
                    [key, value],
                    callback);
    });
  };

  this.removeItem = function (key) {
    this.db.transaction(function (tx) {
      tx.executeSql("DELETE FROM Storage WHERE key=?", [key]);
    });
  };
}

function UrlEncode(s) {
  return encodeURIComponent(s).replace(/%20/g, "+");
}

var iPad = navigator.userAgent.match(/iPad/);
var iPod = navigator.userAgent.match(/iPod/);
var iPhone = navigator.userAgent.match(/iPhone/);
var iOS = iPad || iPod || iPhone;

var storage = ((window.localStorage && !iOS) ? new LocalStorage() :
               window.openDatabase ? new SqlStorage() :
               new CookieStorage());

storage.loadRoster = function (callback) {
  function gotItem(value) {
    if (value) {
      try {
        value = JSON.parse(value);
      } catch (err) {
        // aight
      }
    }
    value = value || {};
    callback(value);
    storage.games = value;
  }
  this.getItem("roster", gotItem);
}

storage.loadSheet = function (name, callback) {
  return this.loadRoster(function (games) {
    if (callback)
      callback(games[name]);
  });
}


storage.storeRoster = function (roster, callback) {
  this.games = roster;
  try {
    this.setItem("roster", JSON.stringify(roster), callback);
  } catch (err) {
    if (err.toString().indexOf("QUOTA_EXCEEDED_ERR") != -1) {
      alert("This browser lacks storage capacity to save this game. This game can continue but cannot be saved. (Mobile Safari, I'll wager?)");
      this.storeRoster = function (roster, callback) {
        setTimeout(callback, 0);
      };
      setTimeout(callback, 0);
    } else {
      throw err;
    }
  }
}

storage.addToRoster = function (newguy, callback) {
  this.loadRoster(function (games) {
    games[newguy.Traits.Name] = newguy;
    storage.storeRoster(games, callback);
  });
}

Number.prototype.div = function (divisor) {
  var dividend = this / divisor;
  return (dividend < 0 ? Math.ceil : Math.floor)(dividend);
};


function LevelUpTime(level) {  // seconds
  // 20 minutes for level 1
  // exponential increase after that
  return Math.round((20 + Math.pow(1.15, level)) * 60);
}


let RevString = '&rev=6';
// Rev strings known to server, probably:
// rev=3 is the minimum allowed by server, probably pq6.1
// rev=4 is pq6.2 the longstanding delphi client
// rev=5 is pq6.3 presumably the lazarus port or other unofficial release
// rev=6 is this here, pq-web multiplayer enabled


function getPlayerLevel() {
	return GetI(Traits,'Level')
}


function fastInverseSqrt(number) {
    var i = new Float32Array(1);
    var y = new Float32Array(1);
    const threehalfs = 1.5;

    var x2 = number * 0.5;
    y[0] = number;
    i = new Int32Array(y.buffer);        // evil floating point bit level hacking
    i[0] = 0x5f3759df - (i[0] >> 1);     // what the fuck?
    y = new Float32Array(i.buffer);
    y[0] = y[0] * (threehalfs - (x2 * y[0] * y[0]));    // 1st iteration
    // y[0] = y[0] * (threehalfs - (x2 * y[0] * y[0])); // 2nd iteration, this can be removed

    return y[0];
}


function doPointlessMath(min, max, count) {
    let results = [];
    let totalCount = 0;
    while (results.length < count) {
        let randomValue = Math.random();
        let inverseSqrtValue = fastInverseSqrt(randomValue);
        totalCount++;
        //console.log("Fast Inverse Square Root of " + randomValue + " is " + inverseSqrtValue);
        if (inverseSqrtValue >= min && inverseSqrtValue <= max) {
            results.push(inverseSqrtValue);
        }
    }
    console.log("Total number of FISR iterations run to return values within desired range: " + totalCount);
    
    // Sort the values.
    results.sort((a, b) => a - b);
	//console.log(results)

    // Calculate the average of the top 99%
    let top99PercentIndex = Math.floor(results.length * 0.99);
    let top99PercentValues = results.slice(top99PercentIndex);
    console.log("Top 99% of values: " + top99PercentValues);
    let averageTop99Percent = top99PercentValues.reduce((sum, value) => sum + value, 0) / top99PercentValues.length;

    // Calculate the average of the bottom 1%
    let bottom1PercentIndex = Math.ceil(results.length * 0.01);
    let bottom1PercentValues = results.slice(0, bottom1PercentIndex);
    console.log("Bottom 1% of values: " + bottom1PercentValues);
    let averageBottom1Percent = bottom1PercentValues.reduce((sum, value) => sum + value, 0) / bottom1PercentValues.length;

    console.log("Average of the top 99% of values: " + averageTop99Percent);
    console.log("Average of the bottom 1% of values: " + averageBottom1Percent);

    console.log("Generating choices...");
    // Method 1: Average of valid values
    let averageValidValue = results.reduce((sum, value) => sum + value, 0) / results.length;
	console.log("Average Value: " + averageValidValue);

    // Method 2: Random selection
    let randomIndex = Math.floor(Math.random() * results.length);
    let randomSelection = results[randomIndex];
	console.log("Random Selection: " + randomSelection);

    // Method 3: Median value
    let medianValue = results[Math.floor(results.length / 2)];
	console.log("Median Value: " + medianValue);

    // Method 4: Weighted average
    let weightedAverage = (averageTop99Percent * 0.99) + (averageBottom1Percent * 0.15);
    console.log("Weighted Average: " + weightedAverage);

    // Method 5: Custom Formula
    let customValue = ((averageTop99Percent / Math.PI) + (averageBottom1Percent * Math.PI) + (Math.random() + 1));
	console.log("Custom Formula: " + customValue);

    // Randomly choose one of the methods
	console.log("Randomly selecting 1 of the 5 values...");
    let methods = [averageValidValue, randomSelection, medianValue, weightedAverage, customValue];
    let finalValue = methods[Math.floor(Math.random() * methods.length)];
    console.log("Final dice roll value: " + finalValue);

    return finalValue;
;}

//fixed an issue with declaration of cooldownDuration; -- it would not set correctly previously in some situations. (mainly pageload->first use>2+ result would unlock after 1 min instead of 5
function setTemporaryGameSpeed() {
	var result = 2;
	var cooldownDuration = 300000; // Default to 5 minutes
    if (getPlayerLevel() >= 10) {
        result = doPointlessMath(1.5, 20, 1000);
        setGameSpeed(result);
        // Disable the button
        turboButton.disabled = true;
        turboButton.style.backgroundColor = 'grey';

        // Reset game speed after boost duration
        setTimeout(() => {
            setGameSpeed(1); // Reset to normal speed after the boost duration
        }, 60000);

        // Determine cooldown duration
        if (result < 2) {
            cooldownDuration = 60000; // Set to 1 minute if boost is less than 2x
        }

        // Re-enable the button after disable duration
        setTimeout(() => {
            turboButton.disabled = false;
            turboButton.style.backgroundColor = '';
            console.log("Speed Boost Re-Enabled.");
        }, cooldownDuration);
    } else {
        console.log("Player level less than 10. Boost not permitted.");
    }
}


var K = {};

K.Traits = ["Name", "Race", "Class", "Level"];

K.PrimeStats = ["STR","CON","DEX","INT","WIS","CHA"];
K.Stats = K.PrimeStats.slice(0).concat(["HP Max","MP Max"]);

K.Verbs = [
  "Acquire",
  "Obtain",
  "Collect",
  "Retrieve", 
  "Secure",
  "Gather",
  "Amass",
  "Procure",
  "Accumulate",
  "Gain",
  "Harvest",
  "Capture",
  "Seize",
  "Attain",
  "Fetch",
  "Install",
  "Repair",
  "Replace",
  "Upgrade",
  "Decomission",
  "Seize",
  "Audit",
  "Dismantle"];

K.moreVerbs = [
  "Seek an audience with",
  "Consult",
  "Court with",
  "Send a Candy-Gram to", 
  "Spy on",
  "Eavesdrop on",
  "Visit",
  "Seek Counsel with",
  "Chauffeur",
  "Buttle",
  "Call on",
  "Engage in coitus with",
  "Befriend",
  "Escort",
  "Eliminate",
  "Bring to Justice",
  "Negotiate with",
  "Challenge",
  "Interrogate",
  "Recruit",
  "Banish",
  "Summon",
  "Infiltrate",
  "Rescue",
  "Imprison",
  "Liberate"];

K.spellVerbs = [
  "Performed the Forbidden Dance of",
  "Mastered the art of",
  "Caused an Outage using",
  "Cast the spell of",
  "Conjured the essence of",
  "Invoked the spirit of",
  "Summoned the wrath of",
  "Unleashed the fury of",
  "Harnessed the power of"];
  
K.spellTargets = [
  "upon a small village",
  "across the land",
  "aided by the power of an unseen enemy",
  "by an unknown power",
  "via an unknown force",
  "within the ancient ruins",
  "through the mystical portal",
  "under the full moon",
  "in the heart of the forest",
  "at the break of dawn"];

K.Equips = [
  "Weapon",
  "Shield",
  "Helm",
  "Hauberk",
  "Brassairts",
  "Vambraces",
  "Gauntlets",
  "Gambeson",
  "Cuisses",
  "Greaves",
  "Sollerets"];

K.Spells = [
  "Slime Finger",
  "Rabbit Punch",
  "Hastiness",
  "IT Ticket",
  "Phone Call",
  "Video Call",
  "Tele-Conference",
  "Teams Meeting",
  "Good Move",
  "Sadness",
  "Password Reset",
  "Seasick",
  "MFA",
  "Revoke Session",
  "Shoelaces",
  "Inoculate",
  "Cone of Annoyance",
  "Remote Access",
  "Magnetic Orb",
  "Invisible Hands",
  "Revolting Cloud",
  "Aqueous Humor",
  "Message-Trace",
  "Restore Backup",
  "Root Cause Analysis",
  "Business Intelligence",
  "Spectral Miasma",
  "Clever Fellow",
  "Sharp Tongue",
  "Lockjaw",
  "History Lesson",
  "Release from Quarantine",
  "Hydrophobia",
  "Big Sister",
  "Cone of Paste",
  "Mulligan",
  "Nestor's Bright Idea",
  "Holy Batpole",
  "Docusign",
  "Tumor (Benign)",
  "PTO",
  "Upward Mobility",
  "Braingate",
  "Summon a Bitch",
  "Nonplus",
  "Animate Nightstand",
  "Eye of the Troglodyte",
  "Corporate Retraining",
  "Curse Name",
  "Darktrace",
  "Dropsy",
  "Vitreous Humor",
  "Roger's Grand Illusion",
  "Phishing Simulation",
  "Covet",
  "Black Idaho",
  "Astral Miasma",
  "Spectral Oyster",
  "Acrid Hands",
  "Angioplasty",
  "Grognor's Big Day Off",
  "Tumor (Malignant)",
  "Ni!",
  "Animate Tunic",
  "Ursine Armor",
  "Holy Roller",
  "Tonsillectomy",
  "Curse Family",
  "Corporate Espionage",
  "Infinite Confusion",
  "Release the Kraken",
  "French Taunting"];

K.OffenseAttrib = [
  "Polished|+1",
  "Serrated|+1",
  "Heavy|+1",
  "Pronged|+2",
  "Steely|+2",
  "Vicious|+3",
  "Venomed|+4",
  "Stabbity|+4",
  "Dancing|+5",
  "Invisible|+6",
  "Vorpal|+7"];

K.DefenseAttrib = [
  "Studded|+1",
  "Banded|+2",
  "Gilded|+2",
  "Festooned|+3",
  "Holy|+4",
  "Cambric|+1",
  "Fine|+4",
  "Impressive|+5",
  "Custom|+3"];

K.Shields = [
  "Parasol|0",
  "Pie Plate|1",
  "Garbage Can Lid|2",
  "Buckler|3",
  "Plexiglass|4",
  "Fender|4",
  "Round Shield|5",
  "Carapace|5",
  "Scutum|6",
  "Propugner|6",
  "Kite Shield|7",
  "Pavise|8",
  "Tower Shield|9",
  "Baroque Shield|11",
  "Aegis|12",
  "Magnetic Field|18"];

K.Armors = [
  "Lace|1",
  "Macrame|2",
  "Burlap|3",
  "Canvas|4",
  "Flannel|5",
  "Chamois|6",
  "Pleathers|7",
  "Leathers|8",
  "Bearskin|9",
  "Ringmail|10",
  "Scale Mail|12",
  "Chainmail|14",
  "Splint Mail|15",
  "Platemail|16",
  "ABS|17",
  "Kevlar|18",
  "Titanium|19",
  "Mithril Mail|20",
  "Diamond Mail|25",
  "Plasma|30"];

K.Weapons = [
  "Stick|0",
  "Broken Bottle|1",
  "Shiv|1",
  "Sprig|1",
  "Oxgoad|1",
  "Eelspear|2",
  "Bowie Knife|2",
  "Claw Hammer|2",
  "Handpeen|2",
  "Andiron|3",
  "Hatchet|3",
  "Tomahawk|3",
  "Hackbarm|3",
  "Crowbar|4",
  "Mace|4",
  "Battleadze|4",
  "Leafmace|5",
  "Shortsword|5",
  "Longiron|5",
  "Poachard|5",
  "Baselard|5",
  "Whinyard|6",
  "Blunderbuss|6",
  "Longsword|6",
  "Crankbow|6",
  "Blibo|7",
  "Broadsword|7",
  "Kreen|7",
  "Warhammer|7",
  "Morning Star|8",
  "Pole-adze|8",
  "Spontoon|8",
  "Bastard Sword|9",
  "Peen-arm|9",
  "Culverin|10",
  "Lance|10",
  "Halberd|11",
  "Poleax|12",
  "Bandyclef|15"];

K.Specials = [
  "Diadem",
  "Festoon",
  "Gemstone",
  "Phial",
  "Tiara",
  "Scabbard",
  "Arrow",
  "Lens",
  "Lamp",
  "Hymnal",
  "Fleece",
  "Laurel",
  "Brooch",
  "Goblet",
  "Giblet",
  "Gimlet",
  "Cobble",
  "Albatross",
  "Brazier",
  "Bandolier",
  "Tome",
  "Garnet",
  "Gauntlet",
  "Amethyst",
  "Candelabra",
  "Corset",
  "Corde",
  "Lasso",
  "Indy's Whip™",
  "Holy Grail",
  "Sphere",
  "Sceptre",
  "Ankh",
  "Talisman",
  "Orb",
  "Gammel",
  "Gavel",
  "ULINE Quiet Tape™",
  "Pantaloons",
  "Portable Toilet",
  "Mop Bucket",
  "Ornament",
  "Brocade",
  "Galoon",
  "Bijou",
  "Spangle",
  "Gimcrack",
  "Hood",
  "Vulpeculum",
  "Report",
  "Stock Certificate",
  "Profits",
  "Quarterly Analysis",
  "License",
  "S.O.W.",
  "N.D.A.",
  "Laptop",
  "Server",
  "Headset",
  "Monitor",
  "Printer",
  "Docking Station",
  "iFixit Toolkit",
  "Webcam",
  "Projector",
  "Flash Drive",
  "Hard Drive",
  "SSD",
  "BitLocker",
  "Universal Receiver",
  "Universal Transmitter",
  "Wireless Mouse",
  "Wireless Keyboard",
  "Wireless Keyboard & Mouse Combo",
  "Bluetooth Peripheral",
  "Indy's Refrigerator™",
  "GPU",
  "CPU",
  "PSU",
  "OLED",
  "Quarantined Email",
  "T-SQL",
  "SQL Server",
  "Hosted Service",
  "Identity",
  "Stopwatch",
  "Tablet",
  "Switch",
  "Router",
  "Firewall",
  "Codex",
  "Source Code",
  "Memory Card",
  "Rain Napper"];

K.ItemAttrib = [
  "Golden",
  "Gilded",
  "Spectral",
  "Astral",
  "Garlanded",
  "Precious",
  "Crafted",
  "Dual",
  "Filigreed",
  "Cruciate",
  "Arcane",
  "Blessed",
  "Bewitched",
  "Bewitching",
  "Reverential",
  "Lucky",
  "Enchanted",
  "Gleaming",
  "Grandiose",
  "Sacred",
  "Legendary",
  "Mythic",
  "Crystalline",
  "Austere",
  "Ostentatious",
  "One True",
  "Proverbial",
  "Fearsome",
  "Deadly",
  "Benevolent",
  "Unearthly",
  "Magnificent",
  "Copper",
  "Tin",
  "Nickel",
  "Bronze",
  "Iron",
  "Silver",
  "Gold",
  "Diamond",
  "Platinum",
  "Titanium",
  "Fel",
  "Thorium",
  "Adamantite",
  "Saronite",
  "Adamantium",
  "Vibranium",
  "Unobtanium",
  "Mithril",
  "Kryptonian",
  "Kryptonite",
  "Nth Metal",
  "Element X",
  "Promethium",
  "Dionesium",
  "Ormolu",
  "Morgul",
  "Puissant",
  "Double Holy",
  "Cyber",
  "Cybernetic",
  "Trend-Setting",
  "1337",
  "Renowned",
  "Electronic",
  "3D Printed",
  "Prismatic",
  "Gold-Plated",
  "Nickel-Plated",
  "Pearlescent",
  "Iridescent",
  "Luminescent",
  "Opalescent",
  "Opulent",
  "Corpulent",
  "Antique",
  "Nuclear",
  "Atomic",
  "Sub-Atomic",
  "Infinity",
  "Fiber-Optic",
  "Self-Hosted",
  "Azure Cloud",
  "Managed",
  "Emotional Support",
  "Service",
  "Docusigned",
  "Forbidden",
  "Rogue"];

K.ItemOfs = [
  "Foreboding",
  "Foreshadowing",
  "Nervousness",
  "Happiness",
  "Torpor",
  "Danger",
  "Craft",
  "Silence",
  "Invisibility",
  "Rapidity",
  "Pleasure",
  "Practicality",
  "Hurting",
  "Bewitching",
  "Joy",
  "Petulance",
  "Intrusion",
  "Chaos",
  "Suffering",
  "Extroversion",
  "Frenzy",
  "Sisu",
  "Solitude",
  "Punctuality",
  "Efficiency",
  "Comfort",
  "Patience",
  "Internment",
  "Incarceration",
  "Misapprehension",
  "Loyalty",
  "Envy",
  "Acrimony",
  "Worry",
  "Fear",
  "Awe",
  "Guile",
  "Prurience",
  "Fortune",
  "Judgement",
  "Perspicacity",
  "Domination",
  "Submission",
  "Fealty",
  "Hunger",
  "Despair",
  "Cruelty",
  "Grob",
  "Dignard",
  "Ra",
  "Krypton",
  "Lazarus",
  "Class",
  "the Bone",
  "the Shire",
  "the unspoken",
  "the Dizzy Age",
  "He who remains",
  "He who shall not be named",
  "Númenór",
  "the First Age",
  "the Second Age",
  "the Third Age",
  "Nuclear Protection",
  "Radiation",
  "Olde",
  "Antiquity",
  "Diamonique",
  "Electrum",
  "Hydragyrum",
  "Pearlescense",
  "Iridescense",
  "Luminescense",
  "Opalescense",
  "Opulence",
  "Corpulence",
  "the Cloud",
  "Emotional Damage",
  "Emotional Support"];

K.BoringItems = [
  "tape",
  "nail",
  "lunchpail",
  "sock",
  "token",
  "review",
  "Canned Air",
  "I.O.U.",
  "wire",
  "keyboard",
  "mouse",
  "keyboard & mouse combo",
  "TPS Report",
  "Docusign",
  "email",
  "document",
  "spreadsheet",
  "PowerPoint",
  "PDF",
  "envelope",
  "dongle",
  "phone",
  "Android",
  "tablet",
  "iPhone",
  "iPad",
  "broken LCD",
  "floppy",
  "memory card",
  "source code",
  "code",
  "CD",
  "DVD",
  "Blu-Ray Disc",
  "cookie",
  "pint",
  "toothpick",
  "writ",
  "newspaper",
  "letter",
  "plank",
  "hat",
  "egg",
  "coin",
  "needle",
  "bucket",
  "ladder",
  "chicken",
  "twig",
  "dirtclod",
  "counterpane",
  "vest",
  "teratoma",
  "bunny",
  "rock",
  "pole",
  "carrot",
  "canoe",
  "inkwell",
  "hoe",
  "bandage",
  "trowel",
  "towel",
  "planter box",
  "anvil",
  "axle",
  "tuppence",
  "casket",
  "nosegay",
  "trinket",
  "credenza",
  "website",
  "writ",
  "modem",
  "account",
  "hdmi cable",
  "clock",
  "smart watch",
  "chromebook"];

K.Monsters = [
  "Anhkheg|6|chitin,acid",
  "Ant|0|antenna,mandible",
  "Ape|4|ass,fur",
  "Baluchitherium|14|ear,hide",
  "Beholder|10|eyestalk,teeth",
  "Black Pudding|10|saliva",
  "Blink Dog|4|eyelid,paw",
  "Cub Scout|1|neckerchief,scarf",
  "Girl Scout|2|cookie,scarf",
  "Boy Scout|3|merit badge,scarf",
  "Eagle Scout|4|merit badge,scarf",
  "Bugbear|3|skin,carapace",
  "Bugboar|3|tusk,tuft",
  "Boogie|3|slime,snot",
  "Camel|2|hump,spit",
  "Carrion Crawler|3|egg,claw",
  "Catoblepas|6|neck,spunk",
  "Centaur|4|rib,hoof",
  "Centipede|0|leg,hair",
  "Cockatrice|5|wattle,feather",
  "Couatl|9|wing,scales",
  "Crayfish|0|antenna,meat",
  "Demogorgon|53|tentacle,heart",
  "Jubilex|17|gel,ooze",
  "Manes|1|tooth,hair",
  "Orcus|27|wand,oath",
  "Succubus|6|bra,whip",
  "Vrock|8|neck,sinew",
  "Hezrou|9|leg,finger",
  "Glabrezu|10|collar,arm",
  "Nalfeshnee|11|tusk,tail",
  "Marilith|7|arm,scale",
  "Balor|8|whip,shin guard",
  "Yeenoghu|25|flail,chain",
  "Asmodeus|52|lies,leathers",
  "Baalzebul|43|slime,pants",
  "Barbed Devil|8|flame,spike",
  "Bone Devil|9|hook,ribs",
  "Dispater|30|matches,sceptre",
  "Erinyes|6|thong,whip",
  "Geryon|30|cornucopia,cattle",
  "Malebranche|5|fork,epididymitis",
  "Ice Devil|11|snow,piss",
  "Lemure|3|blob,puddle",
  "Pit Fiend|13|seed,venom",
  "Ankylosaurus|9|tail,poo",
  "Brontosaurus|30|brain,snot",
  "Diplodocus|24|fin,spit",
  "Elasmosaurus|15|neck,fin",
  "Gorgosaurus|13|arm,finger",
  "Iguanadon|6|thumb,toe",
  "Megalosaurus|12|jaw,thigh",
  "Monoclonius|8|horn,scale",
  "Pentasaurus|12|head,foot",
  "Stegosaurus|18|plate,spike",
  "Triceratops|16|horn,big pile of shit",
  "Tyrannosaurus Rex|18|forearm,egg",
  "Djinn|7|lamp,wish",
  "Doppelganger|4|face,dna",
  "Black Dragon|7|*,flame",
  "Plaid Dragon|7|sporrin,*",
  "Blue Dragon|9|*,fire",
  "Beige Dragon|9|*,smoke",
  "Brass Dragon|7|pole,*",
  "Tin Dragon|8|*,kidney",
  "Bronze Dragon|9|medal,*",
  "Chromatic Dragon|16|scale,*",
  "Copper Dragon|8|loafer,*",
  "Gold Dragon|8|filling,*",
  "Green Dragon|8|*,scale",
  "Platinum Dragon|21|*,eye",
  "Red Dragon|10|cocktail,*",
  "Silver Dragon|10|*,tooth",
  "White Dragon|6|tooth,*",
  "Dragon Turtle|13|shell,soup",
  "Dryad|2|acorn,sweat",
  "Dwarf|1|drawers,beard",
  "Eel|2|sashimi,soup",
  "Efreet|10|cinder",
  "Sand Elemental|8|glass",
  "Bacon Elemental|10|bits",
  "Porn Elemental|12|lube,jism",
  "Cheese Elemental|14|curd",
  "Hair Elemental|16|follicle",
  "Swamp Elf|1|lilypad",
  "Brown Elf|1|tusk",
  "Sea Elf|1|jerkin",
  "Ettin|10|fur",
  "Frog|0|leg",
  "Violet Fungi|3|spore",
  "Gargoyle|4|gravel",
  "Gelatinous Cube|4|jam",
  "Ghast|4|vomit",
  "Ghost|10|*",
  "Ghoul|2|muscle",
  "Humidity Giant|12|drops",
  "Beef Giant|11|steak",
  "Quartz Giant|10|crystal",
  "Porcelain Giant|9|fixture",
  "Rice Giant|8|grain",
  "Cloud Giant|12|condensation",
  "Fire Giant|11|cigarettes",
  "Frost Giant|10|snowman",
  "Hill Giant|8|corpse",
  "Stone Giant|9|hatchling",
  "Storm Giant|15|barometer",
  "Mini Giant|4|pompadour",
  "Gnoll|2|collar",
  "Gnome|1|hat",
  "Goblin|1|ear",
  "Grid Bug|1|carapace",
  "Jellyrock|9|seedling",
  "Beer Golem|15|foam",
  "Oxygen Golem|17|platelet",
  "Cardboard Golem|14|recycling",
  "Rubber Golem|16|ball",
  "Leather Golem|15|fob",
  "Gorgon|8|testicle",
  "Gray Ooze|3|gravy",
  "Green Slime|2|sample",
  "Griffon|7|nest",
  "Banshee|7|larynx",
  "Harpy|3|mascara",
  "Hell Hound|5|tongue",
  "Hippocampus|4|mane",
  "Hippogriff|3|egg",
  "Hobgoblin|1|patella",
  "Homunculus|2|fluid",
  "Hydra|8|gyrum",
  "Imp|2|tail",
  "Invisible Stalker|8|*",
  "Iron Peasant|3|chaff",
  "Jumpskin|3|shin",
  "Kobold|1|penis",
  "Leprechaun|1|wallet",
  "Leucrotta|6|hoof",
  "Lich|11|crown",
  "Lizard Man|2|tail",
  "Lurker|10|sac",
  "Manticore|6|spike",
  "Mastodon|12|tusk",
  "Medusa|6|eye",
  "Multicell|2|dendrite",
  "Pirate|1|booty",
  "Berserker|1|shirt",
  "Caveman|2|club",
  "Dervish|1|robe",
  "Merman|1|trident",
  "Mermaid|1|gills",
  "Mimic|9|hinge",
  "Mind Flayer|8|tentacle",
  "Minotaur|6|map",
  "Yellow Mold|1|spore",
  "Morkoth|7|teeth",
  "Mummy|6|gauze",
  "Naga|9|rattle",
  "Nebbish|1|belly",
  "Neo-Otyugh|11|organ ",
  "Nixie|1|webbing",
  "Nymph|3|hanky",
  "Ochre Jelly|6|nucleus",
  "Octopus|2|beak",
  "Ogre|4|talon",
  "Ogre Mage|5|apparel",
  "Orc|1|snout",
  "Otyugh|7|organ",
  "Owlbear|5|feather",
  "Pegasus|4|aileron",
  "Peryton|4|antler",
  "Piercer|3|tip",
  "Pixie|1|dust",
  "Man-o-war|3|tentacle",
  "Purple Worm|15|dung",
  "Quasit|3|tail",
  "Rakshasa|7|pajamas",
  "Rat|0|tail",
  "Remorhaz|11|protrusion",
  "Roc|18|wing",
  "Roper|11|twine",
  "Rot Grub|1|eggsac",
  "Rust Monster|5|shavings",
  "Satyr|5|hoof",
  "Sea Hag|3|wart",
  "Silkie|3|fur",
  "Shadow|3|silhouette",
  "Shambling Mound|10|mulch",
  "Shedu|9|hoof",
  "Shrieker|3|stalk",
  "Skeleton|1|clavicle",
  "Under-Skeleton|10|pelvis",
  "Spectre|7|vestige",
  "Sphinx|10|paw",
  "Spider|0|web",
  "Sprite|1|can",
  "Stirge|1|proboscis",
  "Stun Bear|5|tooth",
  "Stun Worm|2|trode",
  "Su-monster|5|tail",
  "Sylph|3|thigh",
  "Titan|20|sandal",
  "Trapper|12|shag",
  "Treant|10|acorn",
  "Triton|3|scale",
  "Troglodyte|2|tail",
  "Troll|6|hide",
  "Umber Hulk|8|claw",
  "Unicorn|4|blood",
  "Vampire|8|pancreas",
  "Wight|4|lung",
  "Will-o'-the-Wisp|9|wisp",
  "Wraith|5|finger",
  "Wyvern|7|wing",
  "Xorn|7|jaw",
  "Yeti|4|fur",
  "Zombie|2|forehead",
  "Wasp|0|stinger",
  "Rat|1|tail",
  "Bunny|0|ear",
  "Moth|0|dust",
  "Beagle|0|collar",
  "Midge|0|corpse",
  "Ostrich|1|beak",
  "Billy Goat|1|beard",
  "Bat|1|wing",
  "Koala|2|heart",
  "Wolf|2|paw",
  "Whippet|2|collar",
  "Uruk|2|boot",
  "Poroid|4|node",
  "Moakum|8|frenum",
  "Fly|0|*",
  "Hogbird|3|curl",
  "Wolog|4|lemma",
  "New-Hire Orientation|0|*",
  "Mandatory Training|1|certificate",
  "3D Print|3|residue",
  "Rogue Phishing Simulation|9|spam",
  "Rogue AI|15|neural-net",
  "Competing Business|8|customers",
  "Corporation|20|market share",
  "Terminated Employee|5|security badge",
  "Nagging Support Issue|7|documentation",
  "Junk Mail|1|ticket",
  "Spam|4|ticket",
  "Phishing Attack|10|remidiation",
  "Cyber-Attack|20|cyber points",
  "Service Advisory|5|notification",
  "Outage|10|resolution",
  "On-Call Rotation|6|Comp Day",
  "Scrub|1|chaff",
  "Sony® Trinitron™|8|vaccuum tube",
  "Audit|7|certification",
  "Access Request|1|closed ticket",
  "SOX Audit|20|Compliance Report",
  "Phishing Victim|3|Cybersecurity Training",
  "Virtual Happy Hour|15|time you won't get back",
  "Team Building Exercise|7|lowered faith in humanity",
  "Script Kiddie|4|Dorito Dust,sticky tissue",
  "Company Christmas Party|0|compromising selfie",
  "Dish Monster|5|soap suds",
  "Cabling Rat's Nest|2|copper wire",
  "Credential|4|session hash",
  "Compromised Account|6|PII Data",
  "TCB Phising Message|7|support ticket",
  "Password Spray Attack|9|IP Address List"];

K.MonMods = [
  "-4 fœtal *",
  "-4 dying *",
  "-3 crippled *",
  "-3 baby *",
  "-2 adolescent *",
  "-2 very sick *",
  "-1 lesser *",
  "-1 undernourished *",
  "+1 greater *",
  "+1 * Elder",
  "+2 war *",
  "+2 Battle-*",
  "+3 Were-*",
  "+3 undead *",
  "+4 giant *",
  "+4 * Rex"];

K.OffenseBad = [
  "Dull|-2",
  "Tarnished|-1",
  "Rusty|-3",
  "Padded|-5",
  "Bent|-4",
  "Mini|-4",
  "Rubber|-6",
  "Nerf|-7",
  "Unbalanced|-2"];

K.DefenseBad = [
  "Holey|-1",
  "Patched|-1",
  "Threadbare|-2",
  "Faded|-1",
  "Rusty|-3",
  "Motheaten|-3",
  "Mildewed|-2",
  "Torn|-3",
  "Dented|-3",
  "Cursed|-5",
  "Plastic|-4",
  "Cracked|-4",
  "Warped|-3",
  "Corroded|-3"];

K.Races = [
  "Half Orc|HP Max",
  "Half Man|CHA",
  "Half Halfling|DEX",
  "Double Hobbit|STR",
  "Hob-Hobbit|DEX,CON",
  "Low Elf|CON",
  "Dung Elf|WIS",
  "Talking Pony|MP Max,INT",
  "Gyrognome|DEX",
  "Lesser Dwarf|CON",
  "Crested Dwarf|CHA",
  "Corporate Underling|CON",
  "Eel Man|DEX",
  "Panda Man|CON,STR",
  "Trans-Kobold|WIS",
  "Enchanted Motorcycle|MP Max",
  "Will o' the Wisp|WIS",
  "Battle-Finch|DEX,INT",
  "Double Wookiee|STR",
  "Skraeling|WIS",
  "Demicanadian|CON",
  "Land Squid|STR,HP Max",
  "Were-Mermaid|CHA,INT",
  "Rock Monster|CON,HP Max"];

K.Klasses = [
  "Ur-Paladin|WIS,CON",
  "Voodoo Princess|INT,CHA",
  "Robot Monk|STR",
  "Mu-Fu Monk|DEX",
  "Mage Illusioner|INT,MP Max",
  "Shiv-Knight|DEX",
  "Inner Mason|CON",
  "Fighter/Organist|CHA,STR",
  "Puma Burgular|DEX",
  "Runeloremaster|WIS",
  "Hunter Strangler|DEX,INT",
  "Battle-Felon|STR",
  "Tickle-Mimic|WIS,INT",
  "Slow Poisoner|CON",
  "Bastard Lunatic|CON",
  "Lowling|WIS",
  "Birdrider|WIS",
  "Vermineer|INT",
  "Standard Nerd|STR,WIS",
  "Mohawk|STR,DEX",
  "Kraken Hunter|HP Max,MP Max",
  "Gingerbread Maker|CON,HP Max",
  "IT Guy|CON,WIS",
  "Stonewarden|STR,CON"];

K.Titles = [
  "Chud",
  "Mr.",
  "Mrs.",
  "Sir",
  "Sgt.",
  "Ms.",
  "Captain",
  "Chief",
  "Officer",
  "Esq.",
  "Supervisor",
  "Manager",
  "Padre",
  "Pastor",
  "Admiral",
  "Monsignor",
  "Saint"];

K.ImpressiveTitles = [
  "King",
  "Queen",
  "Lord",
  "Lady",
  "Viceroy",
  "Mayor",
  "Prince",
  "Princess",
  "Chief",
  "Boss",
  "Archbishop",
  "Chancellor",
  "Baroness",
  "Inquistor",
  "Director",
  "Executive",
  "Vice-President",
  "President",
  "Owner",
  "Founder"];

K.KlassTitles = [
   "High",
   "Low",
   "Grand",
   "Exhalted",
   "Exiled"];
