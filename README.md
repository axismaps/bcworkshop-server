# bcworkshop-server
Community mapping tools and services

## Express Functions

### /collect/add

**POST:** GeoJSON of single neighborhood polygon with attributes

**Attributes:**

1. Name
2. Comments
3. Confidence
4. Session ID (random hash created as client-side cookie)

**Returns:** Status of success or failure
