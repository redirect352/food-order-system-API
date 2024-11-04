--@param $1:dishesId
--@param {Int} $2:maxImgCount

select id as "dishId", path, name from (
SELECT dish.id, image.path, image.name, row_number() over (partition by dish.id order by image.uploaded desc) as numb 
	FROM public.dish
  	inner join image_tag on to_tsvector('russian', dish.name) @@ plainto_tsquery('russian', "image_tag"."tagName")
	inner join "_imageToimage_tag" j  on j."B" =  image_tag.id
	inner join image on j."A" = image.id
  where dish.id = ANY($1)
  ) as t
where t.numb <= $2

