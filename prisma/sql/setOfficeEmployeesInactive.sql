--@param {Int} $1:officeId

update employee 
  set active=false
  where "officeId"=$1
  and
  id not in (
    select employee.id from employee 
    inner join public.user usr on employee.id = "employeeId" 
    where usr.role != 'client' and employee."officeId" = $1
  )