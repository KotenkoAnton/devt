module Zabbix
  class << self
    WHATS_UP_GROUP_ID = ENV['GROUP_ID']
    ICMP_PING_TEMPLATE_ID = ENV['PING_TEMPLATE_ID']

    def find_host_id(ip)
      response =
        request("host.get", "filter": { "host": [ip] })
      response.first&.[]("hostid")&.to_i
    end

    def add_by_ip(ip)
      zbx_id = find_host_id(ip)
      return { success: "true", zbx_id: zbx_id } if zbx_id

      response =
        request("host.create", "host": ip,
                               "interfaces": [{ "type": 1, "main": 1, "useip": 1,
                                                "dns": "", "ip": ip, "port": "10050" }],
                               "groups": [{ "groupid": WHATS_UP_GROUP_ID.to_s }],
                               "templates": [{ "templateid": ICMP_PING_TEMPLATE_ID.to_s }])
      return { success: "false", error: "bad params" } unless response

      { success: "true", zbx_id: response['hostids'].first.to_i }
    end

    def add(ip_address)
      zbx_id = add_by_ip(ip_address.ip_address)[:zbx_id]
      return { success: "false", error: "could not create/find zbx_id" } unless zbx_id

      ip_address.zbx_id = zbx_id
      return { success: "true", zbx_id: zbx_id } if ip_address.save

      { success: "false", error: "could not save ip_address" }
    end

    def remove(ip_address)
      response =
        request("host.delete", [ip_address.zbx_id.to_s])
      return { success: "false", error: "bad params" } unless response

      ip_address.zbx_id = nil
      return { success: "true" } if ip_address.save!

      { success: "false", error: "could not save device" }
    end

    def add_all
      IpAddress.all.each do |ip_address|
        add(ip_address)
      end
    end

    def update_all_availability
      IpAddress.all.each do |ip_address|
        next unless ip_address.zbx_id

        ip_address.icmp_available = available?(ip_address)
        ip_address.save
      end
    end

    def icmp_ping_items(zbx_id, search = {})
      request("item.get", "output": "extend", "hostids": [zbx_id], "search": search)
    end

    def available?(ip_address)
      icmp_ping_items(ip_address.zbx_id, "name": "ICMP ping").first["lastvalue"].to_i
    end

    def request(method, params)
      response =
        RestClient.post(ENV['ZABBIX_URL'],
                        { jsonrpc: "2.0",
                          params: params,
                          method: method,
                          auth: ENV['ZABBIX_AUTH'],
                          id: 1 }.to_json,
                        content_type: :json, accept: :json)
      JSON.parse(response)['result']
    end
  end
end
