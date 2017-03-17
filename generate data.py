import requests
import datetime
from  functools import reduce
import time

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

contributor_data = getContributorData()
commits_by_author, total = q1(contributor_data)
print(commits_by_author)
print("Total:", total)
additions_per_month, deletions_per_month = q2(contributor_data)
print("sums of additions by all authors , for each month from Jan 2016 to June 2016:")
print(additions_per_month)
print("sums of deletions by all authors , for each month from Jan 2016 to June 2016:")
print(deletions_per_month)