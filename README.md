# npmco.de-search

## Usage

### `POST /search?q=<search-term>`

#### Example response
```json
[
  {
    "package": "groovebasin",
    "filename": "lib/web_socket_api_client.js",
    "score": 0.29015115,
    "content": [
      "(<em>JSON.stringify</em>({\n      name: name,\n      args: args,\n    }));\n  } catch (err) {\n    // nothing to do"
    ]
  },
  {
    "package": "sequelize-cli",
    "filename": "test/url.test.js",
    "score": 0.27371186,
    "content": [
      "(<em>JSON.stringify</em>(helpers.getTestConfig()), \"config/config.json\"))\n      .pipe(helpers.runCli(\"db:migrate \" + flag"
    ]
  }
]
```
