# bcworkshop-server
Community mapping tools and services

## Installation instructions
Install node dependencies:
```
npm install
```

Add your postgres connection string to /server/db.js like:
```
exports.conn = 'postgres://username:password@db-host/database';
```


## Express Functions

### /add

**POST:** GeoJSON of single neighborhood polygon with attributes

**Attributes:**

1. Name
2. Comments
3. Confidence
4. Session ID (random hash created as client-side cookie)

**Returns:** Status of success or failure

### /names

**Returns:** Flat array of names for each neighborhood in the final table

### /download

**Returns:** GeoJSON file for download with `id` `name` and `description` as `properties` values.
