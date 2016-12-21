#!/usr/bin/perl


$input = "
rpit5	192.168.8.22	B8:27:EB:65:29:F0	never
rpit3	192.168.8.23	B8:27:EB:76:B5:04	never
rpit4	192.168.8.24	B8:27:EB:73:58:81	never
rpip5	192.168.8.25	B8:27:EB:EF:F7:52	never
rpip6	192.168.8.26	B8:27:EB:1B:FA:BF	never
rpip7	192.168.8.27	B8:27:EB:C7:03:F5	never
rpip8	192.168.8.28	B8:27:EB:88:F6:3E	never
rpip9	192.168.8.29	B8:27:EB:6F:5D:00	never
rpip10	192.168.8.30	B8:27:EB:12:F3:EC	never
lizard	192.168.8.20	00:23:12:29:AB:6F	03:18:57
    ";
@lines = split /\n/, $input;


%host_lookup_table = qw(
    rpit5    demo-rpi2
    rpit3    demo-rpi3
    rpit4    demo-rpi4
    rpip5    demo-rpi5
    rpip6    demo-rpi6
    rpip7    demo-rpi7
    rpip8    demo-rpi8
    rpip9    demo-rpi9
    rpip10   demo-rpi10
    );

# generate reverse mapping
for $host (sort keys %host_lookup_table) {
    $host_reverse_mapping_lookup_table{$host_lookup_table{$host}} = $host;
}


# %output_lines;

for $line (@lines) {
    chomp $line;
    ($host, $ip, $mac, @junk) = split /\s+/, $line;
    #warn "line $line\n";
    if ($host =~ /^rpi/) {
	warn "($host, $ip, $mac)\n";
	$output_host = $host_lookup_table{$host};
	unless ($output_host) {
	    $output_host = "demo-test";
	}

	$output_line = "# assigned host name: $host
Host ${output_host}
  HostName ${ip}
  User pi
  StrictHostKeyChecking no
";
	warn "$output_host\n";
	$output_lines{$output_host} =  $output_line;
    }
}

for $host (sort keys %output_lines) {
    print "${output_lines{$host}}\n";
}
print "\n";

$hosts = join ",", sort keys %output_lines;
warn "pi" . '@' . "{" . $hosts . "}\n";
