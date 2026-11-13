
**2.5.1 / 2026-10-10**
- fix - enotation and leading zero cases with surrounding spaces

**2.5.0 / 2026-10-10**
- fix: lib should return original non-infinity non-numeric strings

**2.4.2 / 2026-08-14**
- fix: trimZeros to avoid quadratic complexity

**2.4.1 / 2026-06-18**
- deps: update anynum to 1.0.1

**2.4.0 / 2026-06-09**
- support unicode numerals using 'anynum'

**2.3.0 / 2026-05-07**
- support octal and binary, test with @byspec/numbers
- test with @byspec/numbers


**2.2.3 / 2026-04-07**
- remove unnecessary files from npm package

**2.2.2 / 2026-03-23**
- fix for space string


**2.2.1 / 2026-03-19**
- fix false positive for eNotation when no leading zeros

**2.2.0 / 2026-02-28**
- support infinity

**2.1.0 / 2025-05-01**
- fix e-notation 
  - to return string when invalid enotation is found. Eg `E24`
  - to return valid number when only leading zero before e char is present

**2.0.5 / 2025-02-27**
- changes done in 1.1.2

**1.1.2 / 2025-02-27**
- fix skiplike for 0

**1.1.1 / 2025-02-21**
- All recent fixes of version 2

**2.0.4 / 2025-02-20**
- remove console log

**2.0.3 / 2025-02-20**
- fix for string which are falsly identified as e-notation

**2.0.1 / 2025-02-20**
- fix: handle only zeros
- fix: return original string when NaN

**2.0.0 / 2025-02-20**
- Migrating to ESM modules. No functional change

**1.1.0 / 2025-02-20**
- fix (#9): support missing floating point and e notations