# JSONPath to SQL/JSONPath
![](https://img.shields.io/badge/compliance-%20~90%25-green?style=for-the-badge) ![](https://img.shields.io/bundlephobia/min/@vaimee/jsonpath-to-sqljsonpath?style=for-the-badge)

This library is a tentative mapping of emerging [JSONPath standard](https://datatracker.ietf.org/doc/html/draft-ietf-jsonpath-base) to [SQL/JSONPath](https://www.iso.org/standard/67367.html). Currently, the library follows closely the tests reported in [jsonpath-compliance-test-suite](https://github.com/jsonpath-standard/jsonpath-compliance-test-suite) and it verifies the mapping using [PostgresSQL](https://www.postgresql.org/) as a db service.

## Getting started
The JSONPath to SQL/JSONPath is a small TypeScript library that can be used in any NodeJS or Browser application. 

### Installation - Node
```
npm i @vaimee/jsonpath-to-sqljsonpath
```

### Installation - Browser
TBD

## Usage

The library exports two main component: the `parser` object, and the `transform` function. When you just one to 
translate a [JSONPath query](https://datatracker.ietf.org/doc/html/draft-ietf-jsonpath-base) you can use the `transform` method:
```ts

import { transform } from '@vaimee/jsonpath-to-sqljsonpath'

const queries: string[] = transform("$.hello.world[?@.test > 3]")

``` 

The result of the transformation process is a list of [SQL/JSONPath queries](https://www.iso.org/standard/67367.html) that should be issued to the database. Here is an example of how to use the queries returned to interogate a DataBase complaint with the standard: 
```ts
import { transform } from '@vaimee/jsonpath-to-sqljsonpath'

const queries: string[] = transform("$.hello.world[?@.test > 3]")
const queryResult = await knex.unionAll(

queries.map((query) => {
    return knex.table(table).select(knex.raw('jsonb_path_query(document, ?) as result', query)).where({ id });
}));

const JSONPathResult = queryResult.map((result) => {
  return result.result;
});
```

The variable JSONPathResult will contain the JSONPath complaint query result.

## Limitations
The library uses a best effort approach, but we found that some of JSONPath feature cannot be translated to SQL/JSONPath. Currently the known limitations are:
- **Negative steps** are not supported (`"$.array[1:5:-1]`). SQL/JSONPath is strict about the ordering of the elements selected from an array and those are always in a ascending order. Therefore, we cannot simulate a negative step that would reverse the natural order of the returned elements. 

## Contributing
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## Contact
[VAIMEE](vaimee.com) - [info@vaimee.com](mailto:info@vaimee.com)

[Cristiano Aguzzi](team.vaimee.com/cristiano) - [cristiano.aguzzi@vaimee.com](mailto:cristiano.aguzzi@vaimee.com)

[Lorenzo Gigli]() - [lorenzo.gigli@vaimee.com](mailto:lorenzo.gigli@vaimee.com)

## Acknowledgments

This library is part of [Zion](https://github.com/vaimee/zion/tree/main) a Thing Description Directory developed inside the [Ontochain](https://ontochain.ngi.eu/) European programme. 
