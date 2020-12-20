# Simple JavaScript extension manager for [Osquery](https://github.com/osquery/osquery)

Custom tables can be implemented in JavaScript and added to Osquery using extension manager.

Custom tables must extend `TablePlugin` class. Example:

```javascript
class SampleTablePlugin extends TablePlugin {
  constructor() {
    super('sample', {foo: 'TEXT', bar: 'INTEGER'});
  }

  generate() {
    return [
      {foo: 'Hello', bar: '1'},
      {foo: 'World', bar: '2'}
    ];
  }
}
```

`TablePlugin` constructor should be called with the unique table name and the column metadata map. Custom table should implement `generate` method which should return the table results as array of map's.

Any number of custom plugins can be implemented and added to extension manager. `start` method can be used to start the extension manager:

```javascript
addPlugin(new SampleTablePlugin());
start();
```

If `socketPath` argument is not provided to `start` method, extension manager tries to communicate with `osqueryd` daemon UNIX domain socket at `/var/run/osquery.em`. If that does not exist, it falls back to using `.osquery/shell.em` in current users *HOME* directory.

Osquery daemon or should should be started with `--nodisable_extensions` flag to enable extension support.

```bash
$ osqueryi --nodisable_extensions
osquery>
```

```bash
$ node examples/sample-table.js
```

```bash
osquery> select * from sample;
+-------+-----+
| foo   | bar |
+-------+-----+
| Hello | 1   |
| World | 2   |
+-------+-----+
```

In addition to custom tables, extension manager can also be used to communicate with Osquery. Once started, it can list extensions, get flags, query tables or get column metadata for a query.