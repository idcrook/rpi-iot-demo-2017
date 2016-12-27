#!/bin/bash -x

# Run the CPU

piType=`gpio -v | grep "Type:" | perl -pe 's/.+Type:\s*//; s/,.+$//' `

echo $piType


if [ x"$piType" == x"Pi 2" ] ; then
    sysbench --test=cpu --num-threads=4  --cpu-max-prime=20000 run
else
    sysbench --test=cpu --num-threads=2  --cpu-max-prime=20000 run
fi
