Mine Forces
===========

[![travis-ci](https://travis-ci.org/CyberZHG/MineForces.svg)](https://travis-ci.org/CyberZHG/MineForces)
[![david-dm](https://david-dm.org/CyberZHG/MineForces.svg)](https://david-dm.org/CyberZHG/MineForces)
[![badge.fury](https://badge.fury.io/js/mine-forces.svg)](https://badge.fury.io/js/mine-forces)
![img.shields](https://img.shields.io/npm/dt/mine-forces.svg)

## Introduction

MineForces is used to filter problems on [Codeforces](http://codeforces.com/). You could get several sets of problems like this:

![EG](https://cloud.githubusercontent.com/assets/853842/11766478/9c47fc7c-a1c4-11e5-9dfb-dc671bc71a08.png)

then you could use [Virtual Judge](http://acm.hust.edu.cn/vjudge/toIndex.action) to host contests with the problems that meet your specific conditions.

## Installation

You need [Node.js](https://nodejs.org/) installed and type the following in command line:

```
sudo npm install -g mine-forces
```

## Usage

```
Usage: mineforces [options]

Options:

  -h, --help              output usage information
  -V, --version           output the version number
  -s, --setting <path>    the path of the setting file
  -u, --user <user_name>  add your id to team value
  -f, --force             force updating the problem information
  -o, --output <path>     save filter result to output path
```

### Default Setting

Setting is stored in a [JSON](http://www.json.org/) file. If you do not provide the path of the file with `-s`, the program will use the default setting:

```javascript
{
  "team": [],
  "chase": [],
  "accepted": false,                        // Single
  "set_num": 10,
  "problem_num": 5,
  "force_update": false,
  "solved": [5000, 2000, 1000, 500, 100],   // Single
  "tag_accept": [],                         // Array
  "tag_reject": [],                         // Array
  "tag_reject_if_single": [],               // Array
  "tag_reject_if_none": false,              // Single
  "id_range": [0, 100000],                  // Array
  "id_alpha": [],                           // Array
  "id_reject": [],                          // Array
  "reject_sub": false,                      // Single
  "ascii_only": true,
  "show_team_status": ["total"],
  "show_problem_detail": ["title", "solved", "tag"],
  "output_path": ""
}
```

### Team

Team contains an array of Codeforces IDs, when your team are practicing together, MineForces is useful to find problems that none of your team members has solved.

#### Example 1 

If you want to find the unsolved problems of `vjudge1`, you can write a json file named `team_1.json`:
```javascript
{
  "team": "vjudge1"
}
```
and type:
```
mineforces -s ./team_1.json
```

or without specifying a json file:
```
mineforces -u vjudge1
```

However, you should __NEVER__ use `vjudge[1-5]` in `team` or `chase` because each of these accounts has thousands of pages of submissions.

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

This property has the same format as `team`, when `chase` is not an empty array, only the problems that `chase` has solved will be returned.

#### Example

Imagine one day you suddenly want to solve all the problems that `tourist` has solved on Codeforces, you can create a json file `chase.json`:
```javascript
{
  "team": "your_cf_id",
  "chase": "tourist"
}
```
and type:
```
mineforces -s chase.json
```

### Accepted

The default value is `false`. When `accepted` is set to `false`, only the unsolved problems will be returned. However, if it is set to `true`, __BOTH__ solved and unsolved problems would be returned. This property is mostly used for testing, you can ignore this property.

### Set Number

The number of problem sets that will be returned.

### Problem Number

The number of problems in one problem set.

### Force Update

The problem stats will not update if it has updated the stats within a week. And the submission information will not be updated if the last update happended within ten minutes.

### What are `Single` & `Array`?

You can see some properties followed with the comment `single` and some with `array`. For a `single` property, if the value is not an array, then this value is used to filter all the problems. Otherwise, the length of the array should be the same as `problem_num`, the value is used to filter the problem with corresponding index. While for a `array` property, if the value is not an array, then the value could be seen as an array with one element. If it is an array of array, then the rule is the same as `single` with an array supplied. 

### Solved

If `solved` is an empty array, then there is no limitation about how many users have solved the problem. If `solved` is non-empty, it should have the same length as `problem_num`. The problem which has a larger solved number will not be returned. For example, the second problem in a problem set which has been solved by 301 users will not be returned if the `solved` value is `[400, 300, 200, 100, 50]`.

#### Example

This property is useful to control the difficulty, if you want a set of problems that has the approximately difficuly as `Div 2`, you can use:

```javascript
{
  "team": "your_cf_id",
  "solved": [5000, 4000, 3000, 1000, 700]
}
```

And if you want a `Div 1`:

```javascript
{
  "team": "your_cf_id",
  "solved": [3000, 1000, 700, 400, 100]
}
```

### Tag Accept

If the value is empty, then all the cateogries will be returned. If the value is non-empty, only the problem with one tag appeared in the `tag_accept` array will be returned.

#### Example

If you want to solve dynamic programming problems only, you can use:
```javascript
{
  "team": "your_cf_id",
  "tag_accept": "dp"
}
```

### Tag Reject

The problem with one tag appeared in the `tag_reject` array will not be returned.

### Tag Reject If Single

The problem which has only one tag and the tag appeared in the `tag_reject_if_single` array will not be returned. This is useful to filter out `implementation` and `brute force`.

### Tag Reject If None

The problem which has no tag yet will not be returned.

### ID Range

If you do not want to solve old problems, you can set:

```javascript
{
  "id_range": [100, 100000]  
}
```

then problems like `99A`, `99B`, `1C` will not returned.

### ID Alpha

If the value is an empty array, then nothing happends. If you want to solve problems like `100E`, `101E`, `102E`, you can set:

```javascript
{
  "id_alpha": "E"
}
```

If you want to specify each problem, you can use:

```javascript
{
  "id_accept": [["A"], ["B"], ["C"], ["D"], ["E"]]
}
```

### ID Reject

The specific problem ids will not returned:

```
{
  "id_reject": ["123B", "456C"]
}
```

### Reject Sub

Some problems have multiple difficulties (`178C1`, `178C2` and `178C3`), these problems will not returned if `reject_sub` is set to `true`.

### ASCII Only

Some problems on Codeforces are not written in English, the problem with a title that has non-ascii character will not return.

### Show Team Status

Show how many problems have been solved by the team in each category. The value could be `total`, `alpha` and `tag`.
  
## License

GPL-2.0
