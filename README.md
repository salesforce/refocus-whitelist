# refocus-whitelist

Utility application for Refocus's API, Real-Time and UI applications to verify
that all inbound requests originate from whitelisted IP addresses.

Currently supports IPv4.

## Configuration

### IP Whitelist

Set environment variable `IP_WHITELIST` with a comma-delimited list of discrete
IP addresses (e.g. `1.2.3.4`) and/or ranges of IP addresses separated by a dash
(e.g. `1.2.3.4-1.2.3.255`).

For example, if you wanted to whitelist "127.0.0.1" *and* all the addresses
between 137.0.0.0-137.255.255.255 (inclusive), you would set your environment
variable like this:

```
IP_WHITELIST=127.0.0.1,137.0.0.0-137.255.255.255
``` 

Note: whitespace around commas and dashes is ignored so this would do the same
thing (if that feels more readable to you):

```
IP_WHITELIST=127.0.0.1, 137.0.0.0 - 137.255.255.255
``` 

If you do not set a whitelist OR you set an empty whitelist, it allows all IP
addresses to access your Refocus applications.

If your `IP_WHITELIST` has any errors or there are any invalid IPv4 addresses,
it refuses requests from all IP addresses to your Refocus applications until
you fix the errors.  

### Refocus API, Real-Time and UI Applications

In each of your Refocus applications, you must set environment variable
`IP_WHITELIST_SERVICE` to the base URL of this application.

## API

### `GET /v1/verify/:address`

If the `:address` provided in the path is a valid IPv4 address, return
status `200 OK` with content-type `application/json`:

```
{
  address: <String>,
  allow: <Boolean>
}
```

If the `:address` provided in the path is *not* a valid IPv4 address, return
status `400 (Bad Request)` with content-type `text/plain`:

```
Invalid IPv4 address: ":address"
```

## Security

If deploying to Heroku, be sure to configure the Heroku application with the
checkbox checked to "Make this app internal to this Private Space". 

## Debug

Set environment variable `DEBUG` with any of these or combinations thereof.

- `refocus-whitelist*` *(all debug AND all trace)*
- `refocus-whitelist:*` *(all debug, no trace)*
- `refocus-whitelist:expressUtils`
- `refocus-whitelist:whitelistUtils`
- `refocus-whitelist-trace:*` *(all trace, no debug)*
- `refocus-whitelist-trace:common`
- `refocus-whitelist-trace:whitelistUtils`

Note: the `refocus-whitelist-trace` options are very verbose.

## Version History

- 1.0.0
