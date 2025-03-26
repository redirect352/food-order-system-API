--@param {Int} $1:officeId
WITH rows AS (
  update employee 
    set active=false
    where "officeId"=$1
    and active=true
    and
    id not in (
      select employee.id from employee 
      inner join public.user usr on employee.id = "employeeId" 
      where usr.role != 'client' and employee."officeId" = $1
    )
    returning 1
)
select count(*) from rows;