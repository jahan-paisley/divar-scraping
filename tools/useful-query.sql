with revised as (select area, land_area, mobile, count(*) AS COUNT
                 from data_listing
                 group by area, land_area, mobile, category
                 having count(*) > 1
                 ORDER BY COUNT DESC)
select R.COUNT, a.title, a.price, created, a."desc", a.mobile, a.location, a.ext_id
from data_listing a
         JOIN revised r on
            COALESCE(a.mobile, 0) = COALESCE(r.mobile, 0) and
            COALESCE(a.area, 0) = COALESCE(r.area, 0) AND
            COALESCE(a.land_area, 0) = COALESCE(r.land_area, 0)
order by COUNT DESC, a.area, mobile, created, price
