def findMissIT(inp:str):
    print(inp)
    import sys 
    # tokens = inp.strip().split()
    # it = iter(tokens)
    # try:
    #     N = int(next())
    # except:
    #     return []
    score = defaultdict(int)
    first_cnt = defaultdict(int)
    
    for line in inp:
        parts = line.strip().split()
        if not parts:
            continue
        k = int(parts[0])
        if len(parts) < k + 1:
            continue
        ids = list(map(int,parts[1:1+k]))
        
        for pos, cid in enumerate(ids,start=1):
            
            if pos == 1:
                score[cid] += 3
                first_cnt[cid] +=1
            elif pos ==2:
                score[cid] +=2
            elif pos == 3:
                score[cid] +=1
                
    max_score = max(score.values(), default=0) 
    top_by_score = [cid for cid, sc in score.items() if sc == max_score]
    max_first = max((first_cnt[cid] for cid in top_by_score), default = 0)
    winners = [cid for cid in top_by_score if first_cnt[cid] == max_first]
    winners.sort()
    return " ".join(map(str,winners))