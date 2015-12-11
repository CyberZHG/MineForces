Mine Forces
===========

![travis-ci](https://travis-ci.org/CyberZHG/MineForces.svg)
![david-dm](https://david-dm.org/CyberZHG/MineForces.svg)
![badge.fury](https://badge.fury.io/js/mine-forces.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/4b7652276bb9490fab1c389947179095)](https://www.codacy.com/app/CyberZHG/MineForces)

## Introduction

MineForces is used to filter problems on Codeforces.

## Installation

You need [Node.js](https://nodejs.org/) installed and type the following in command line:

```
npm install -g mine-forces
```

## Usage

```
  Usage: mineforces [options]

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -l, --login             login to Codeforces
    -c, --crawl             crawl status from Codeforces
    -f, --filter <options>  get filtered problem sets
```

### Login

```
mineforces -l
```

You should login first before other operations. Generally, the cookie will survive for one month, which means you don't need to login again during this period.

### Crawl

```
mineforces -c
```
```
# Login and crawl
mineforces -l -c
```

Pull your problem status from Codeforces. You should use this operation when you have solved problems on Codeforces or new problems have been released. It may take a few minutes.

### Filter

```
mineforces -f <options>
```
```
# Login, crawl and filter
mineforces -l -c -f <options>
```

This operation will return a few sets of problems depends on the `options`. You can add one set of the problems to [HUST VJudge](http://acm.hust.edu.cn/vjudge/toIndex.action) for training yourself.

`options` is a JSON string:

* `{"accepted": false}`: The default value is `false` and only the unsolved problems will be returned. However, when the value is set to `true`, both accepted and unaccepted problems will be returned.
* `{"set_num": 10}`: The number of returned sets. The default value is `10`.
* `{"problem_num": 5}`: The number of problems in one set. The default value is `5`.
* `{"solved": [5000, 2000, 1000, 500, 100]}`: The length of the value array is the same as `problem_num`, which means the first problem should be solved by less or equal to 5,000 users, and the last problem should be solved by less or equal to 100 users.
* ```
  {"tags": {
     "accept": ["dp", "math"], 
     "reject": ["implementation"],
     "reject-if-single": ["brute force"]
   }
  }
  ``` The default value is `{"tags": {"accept": [], "reject": [], "reject-if-single": []}}`. This value contains three options:
  * `accept`: An empty array `[]` means all tags all acceptable. However, if this value is non-empty, only the problems contain the tags in the accepted array will be returned. For example, a problem with tags `["bitmask", "greedy]"` will not returned since no tag has not appeared in `["dp", "math"]`.
  * `reject`: The problem will not be returned if one of its tag has appeared in the reject array. For example, a problem with tags `["implementation","math"]` will be rejected. Not that `reject` has higher property than `accept`.
  * `reject-if-single`: The problem will not be returned if it has only one tag and this tag appears in the reject-if-single array. This is useful for filtering `"implementation"` and `"brute force"`.

Here is an real example:
```
mineforces -f '{"problem_num": 5, "solved": [800, 400, 200, 100, 50], "tags": {"accept": [], "reject": ["math"], "reject-if-single": ["implementation", "brute force"]}}'
```
This means you don't want to solve math problems and easy problems.
  
## License

GPL-2.0
