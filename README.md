Mine Forces
===========

![travis-ci](https://travis-ci.org/CyberZHG/MineForces.svg)
![david-dm](https://david-dm.org/CyberZHG/MineForces.svg)
![badge.fury](https://badge.fury.io/js/mine-forces.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/4b7652276bb9490fab1c389947179095)](https://www.codacy.com/app/CyberZHG/MineForces)

## Introduction

MineForces is used to filter problems on [Codeforces](http://codeforces.com/).

## Installation

You need [Node.js](https://nodejs.org/) installed and type the following in command line:

```
npm install -g mine-forces
```

## Usage

```
Usage: mineforces [options]

Options:

-h, --help            output usage information
-V, --version         output the version number
-u, --user <user_id>  the id of your Codeforces account
-s, --setting <path>  the path of the setting file
```

### Default Setting

Setting is stored in a [JSON](http://www.json.org/) file. If you do not provide the path of the file, the problem will use the default setting:

```javascript
{
  "accepted": false,
  "team": [],
  "chase": [],
  "set_num": 10,
  "problem_num": 5,
  "solved": [5000, 2000, 1000, 500, 100],
  "tag_accept": [],
  "tag_reject": [],
  "tag_reject_if_single": [],
  "tag_reject_if_none": false
}
```

### Accepted

The default value is `false`. When `accepted` is set to `false`, only the unsolved problems will be returned. However, if it is set to `true`, __BOTH__ solved and unsolved problems would be returned.

### Team

Team contains an array of Codeforces IDs, when your team are practicing together, MineForces is useful to find problems that none of your team members has solved.

#### Example 1 
If you want to find the unsolved problems of `vjudge1`, you can use:
```
mineforces -u vjudge1
```
or you can write a json file named `team_1.json`:
```javascript
{
  "team": ["vjudge1"]
}
```
and type:
```
mineforces -s ./team_1.json
```

#### Example 2
If you have a team contains `vjudge1`, `vjudge2` and `vjudge3`, you can write a json file named `team_2.json`:
```javascript
{
  "team": ["vjudge1", "vjudge2", "vjudge3"]
}
```
and type:
```
mineforces -s ./team_2.json
```

### Chase

This value has the same format as `team`, when `chase` is not an empty array, only the problems that `chase` has solved will be returned.

#### Example

Imagine one day you suddenly want to solve all the problems that `tourist` has solved on Codeforces, you can create a json file `chase.json`:
```javascript
{
  "chase": ["tourist"]
}
```
and type:
```
mineforces -u your_cf_id -s chase.json
```

### Set Number

The number of problem sets that will be returned.

### Problem Number

The number of problems in one problem set.

### Solved

If `solved` is an empty array, then there is no limitation about how many users have solved the problem. If `solved` is non-empty, it should have the same length as `problem_num`. The problem which has a larger solved number will not be returned. For example, the second problem in a problem set which has been solved by 301 users will not be returned if the `solved` value is `[400, 300, 200, 100, 50]`.

#### Example

This property is useful to control the difficulty, if you want a set of problems that has the approximately difficuly as `Div 2`, you can use:
```javascript
{
  "solved": [5000, 4000, 3000, 1000, 700]
}
```
And if you want a `Div 1`:
```javascript
{
  "solved": [3000, 1000, 700, 400, 100]
}
```

### Tag Accept

If the value is empty, then all the cateogries will be returned. If the value is non-empty, only the problem with one tag appeared in the `tag_accept` array will be returned.

#### Example

If you want to solve dynamic programming problems only, you can use:
```javascript
{
  "tag_accept": ["dp"]
}
```

### Tag Reject

The problem with one tag appeared in the `tag_reject` array will not be returned.

### Tag Reject If Single

The problem which has only one tag and the tag appeared in the `tag_reject_if_single` array will not be returned. This is useful to filter out `implementation` and `brute force`.

### Tag Reject If None

The problem which has no tag yet will not be returned.
  
## License

GPL-2.0
