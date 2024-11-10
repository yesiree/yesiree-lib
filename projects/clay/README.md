> NOTE: This is a work-in-progress.

# clay
A simple mock backend for building prototypes

The idea behind this is to provide a simple and powerful backend that just does what backends do out of the box. Of course, it won't scale—and that's the trade-off. Currently, it offers the following:
 - Authentication & Authorization using JWTs
 - Persistent storage via RESOURCEful APIs
   - Support for common HTTP methods (GET, POST, PUT, PATCH, DELETE)
   - Flexible querying
     - Full text search
     - LIKE/contains/Wildcard
     - Regular expressions
     - Less than, greater than, equal to, etc.
     - Boolean comparison

# API

## Auth APIs

### GET /ping

> Retrieves a simple response from the server to ensure it's running properly.

#### Response
```json
{
  "message": String,
  "timestamp": Date
}
```

### POST /auth/login

> Authenticates a user and returns a JWT.

#### Request
```json
{
  "username": String,
  "password": String
}
```

#### Response
```json
{
  "authToken": JWT
}
```

### GET /auth/refresh

> Gets a refreshed token

#### Response

```json
{
  "authToken": JWT
}
```

### GET /auth/users

> Retrieves a list of users from the authentication store

#### Response

```json
[
  {
    "$pid": PID,
    "username": String,
    "role": String
  }
]
```

### GET /auth/users/:pid

> Retrieves a single user by PID

#### Response

```json
{
  "$pid": PID,
  "username": String,
  "role": String
}
```

### POST /auth/users

> Creates a new user with a newly generated PID. If either a "$pid" or "$password" property is supplied, it will be overwritten. The "username", "role", "$pass1", and "$pass2" properties are required. In addition, "$pass1" and "$pass2" must match exactly. The username must be unique. Additional properties may also be provided.

#### Request

```json
{
  username: String,
  role: String,
  $pass1: String,
  $pass2: String
}
```

### PATCH /auth/users/:pid

> Patches an existing user. If the supplied PID matches the user with 'username' equal to 'admin', then the 'username' and 'role' properties must be 'admin'. If a '$password' property is supplied, it will be deleted. The '$password' field cannot be modified directly. You must supply the '$pass1' and '$pass2' fields and they must match each other. The 'username' property must be unique. The '$pid', if supplied, will be overwritten by the PID in the URL. Additional properties may be supplied.

#### Request

```json
{
  // NO REQUIRED FIELDS
}
```

### DELETE /auth/users/:pid

> Deletes the user specified by the PID in the URL

### GET /auth/roles

> Retrieves the list of available roles

#### Response

```json
[ String ]
```

### PUT /auth/roles

> Sets the list of available roles

#### Request

```json
[ String ]
```

### GET /auth/rules

> Retrieves the authorization rules

#### Response

```json
{
  // TODO
}
```

### PUT /auth/rules

> Sets the authorization rules

#### Request

```json
{
  // TODO
}
```

## Resource APIs

> A brief description of how the Resource APIs work

### Collections

### Resources

### PIDs

### GET /api/**/:collection[#,#]

### POST /api/**/:collection

### PUT /api/**/:collection

### DELETE /api/**/:collection

### GET /api/**/:resource

### PUT /api/**/:resource

### PATCH /api/**/:resource

### DELETE /api/**/:resource
