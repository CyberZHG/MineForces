#!/usr/bin/env python
# encode=utf-8

friends, items, threshold = map(int, raw_input().split(' '))
likes = []
for i in range(friends):
    likes.append(raw_input())
ans = 0
for j in range(items):
    count = 0
    for i in range(friends):
        if likes[i][j] == 'Y':
            count += 1
    if count >= threshold:
        ans += 1
print(ans)
