import csv
import datetime
from  functools import reduce
import time

import requests

api_url = "https://api.github.com/"

def getContributorData():
    """Returns data about contributors - total additions, deletions and commits/week."""
    url = api_url + "repos/tungnk1993/scrapy/stats/contributors"
    print("Accessing " + url)
    r = requests.get(url)
    data = r.json()
    return data

is_within_interval = lambda timestamp, start, end:  datetime.datetime.fromtimestamp(timestamp) >= start and datetime.datetime.fromtimestamp(timestamp) < end

def q1(contributorData):
    """Returns a dictionary with the number of commits by each author
    from 1st June 2016 to 1st July 2016, and total commits by everyone in this period."""
    print("Number of commits by each author from 1st June 2016 to 1st July 2016:")
    interval_start = datetime.datetime(2016, 6, 1)
    interval_end = datetime.datetime(2016, 7, 1)
    
    def getCommitsInPeriod(contributorData):
        return reduce(lambda acc, week: acc + week["c"] if is_within_interval(week["w"], interval_start, interval_end) else acc, contributorData["weeks"], 0)
    
    commits_by_author = {contributor["author"]["login"]: getCommitsInPeriod(contributor) for contributor in contributorData}
    total_commits = reduce(lambda a, c: a + c, commits_by_author.values(), 0)
    return commits_by_author, total_commits

def q2(contributorData):
    """Returns a dictionary with the number of commits by each author
    from 1st June 2016 to 1st July 2016, and total commits by everyone in this period."""
    
    def getAdditionsInMonthForContributor(contributorInfo, monthIndex):
        month = monthIndex + 1
        return reduce(lambda acc, week: acc + week["a"] if is_within_interval(week["w"], datetime.datetime(2016, month, 1), datetime.datetime(2016, month+1, 1)) else acc, contributorInfo["weeks"], 0)
    
    def getAdditionsInMonth(monthIndex):
        return reduce(lambda acc, contributor: acc + getAdditionsInMonthForContributor(contributor, monthIndex), contributorData, 0)
    
    additions_per_month = [getAdditionsInMonth(monthIndex) for monthIndex in range(6)]
    
    def getDeletionsInMonthForContributor(contributorInfo, monthIndex):
        month = monthIndex + 1
        return reduce(lambda acc, week: acc + week["d"] if is_within_interval(week["w"], datetime.datetime(2016, month, 1), datetime.datetime(2016, month+1, 1)) else acc, contributorInfo["weeks"], 0)
    
    def getDeletionsInMonth(monthIndex):
        return reduce(lambda acc, contributor: acc + getDeletionsInMonthForContributor(contributor, monthIndex), contributorData, 0)
    
    deletions_per_month = [getDeletionsInMonth(monthIndex) for monthIndex in range(6)]
    
    return additions_per_month, deletions_per_month

def q3(csv_filename):
    """Returns 2 lists with the daily commits for Jan 2016 for authors who's names start with A-M, and N-Z respectively."""
    a_m_daily_commits = [0 for n in range(31)]
    n_z_daily_commits = [0 for n in range(31)]
    with open(csv_filename, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            author_name = row[0]
            commit_time = datetime.datetime.fromtimestamp(int(row[1]))
            first_letter = author_name[0].upper()
            if first_letter >= 'A' and first_letter <= 'M':
                a_m_daily_commits[commit_time.day] += 1
            elif first_letter >= 'N' and first_letter <= 'Z':
                n_z_daily_commits[commit_time.day] += 1
    
    return a_m_daily_commits, n_z_daily_commits

contributor_data = getContributorData()
commits_by_author, total = q1(contributor_data)
print(commits_by_author)
print("Total:", total)

with open('data/q1.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['author', 'commits'])
    for author, commits in commits_by_author.items():
        writer.writerow([author, commits])

additions_per_month, deletions_per_month = q2(contributor_data)
print("sums of additions by all authors , for each month from Jan 2016 to June 2016:")
print(additions_per_month)
print("sums of deletions by all authors , for each month from Jan 2016 to June 2016:")
print(deletions_per_month)

with open('data/q2.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['monthIndex', 'additions', 'deletions'])
    for monthIndex, pair in enumerate(zip(additions_per_month, deletions_per_month)):
        additions, deletions = pair
        writer.writerow([monthIndex, additions, deletions])

q3_csv_filename = input("Enter path to .csv after running the following command:\ngit log --since='1 jan 2016 00:00' --before='1 feb 2016' --pretty=format:'%an, %at' > q3.csv\n: ")
a_m_daily_commits, n_z_daily_commits = q3(q3_csv_filename)
print("Commits for authors with names starting with A-M in Jan 2016:", a_m_daily_commits)
print("Commits for authors with names starting with N-Z in Jan 2016:", n_z_daily_commits)

with open('data/q3.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['dayIndex', 'a_m commits', 'n_z commits'])
    for dayIndex, pair in enumerate(zip(a_m_daily_commits, n_z_daily_commits)):
        a_m_commit, n_z_commit = pair
        writer.writerow([dayIndex, a_m_commit, n_z_commit])