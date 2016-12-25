#!/usr/bin/perl


$input = "
rpit5	192.168.8.22
rpit3	192.168.8.23
rpit4	192.168.8.24
rpip5	192.168.8.25
rpip6	192.168.8.26
rpip7	192.168.8.27
rpip8	192.168.8.28
rpip9	192.168.8.29
rpip10	192.168.8.30
    ";
@lines = split /\n/, $input;

%host_lookup_table = qw(
    rpit5    192.168.8.22
    rpit3    192.168.8.23
    rpit4    192.168.8.24
    rpip5    192.168.8.25
    rpip6    192.168.8.26
    rpip7    192.168.8.27
    rpip8    192.168.8.28
    rpip9    192.168.8.29
    rpip10   192.168.8.30
    );


@output_lines = ();

for $line (@lines) {
    chomp $line;
    ($host, $ip, @junk) = split /\s+/, $line;
    #warn "line $line\n";
    if ($host =~ /^rpi/) {
	warn "($host, $ip)\n";
	$output_ip = $host_lookup_table{$host};

	$output_line = qq|  ${host} [ label=<
            <table border="0" cellborder="1" cellspacing="0" cellpadding="4">
            <tr><td bgcolor="lightblue"><b>${host}</b></td></tr>
            <tr><td bgcolor="lightblue" align="left">IP: {$output_ip}</td></tr>
            </table>
            > shape=box image="img/rpibp.svg" fontcolor=red labelloc=b color="#ffffff"];|;
	#warn "$output_ip\n";
	push @output_lines, $output_line;
    }
}

for $line (@output_lines) {
    print "$line\n";
}
print "\n";
