module Zabbix
  class << self
    WHATS_UP_GROUP_ID = ENV['GROUP_ID']
    ICMP_PING_TEMPLATE_ID = ENV['PING_TEMPLATE_ID']

    def find_host_id(ip_address)
      response =
        request("host.get", "filter": { "host": [ip_address] })
      response.first&.[]("hostid")&.to_i
    end

    def add(device)
      response =
        request("host.create", "host": device.ip_address,
                               "interfaces": [{ "type": 1, "main": 1, "useip": 1,
                                                "dns": "", "ip": device.ip_address, "port": "10050" }],
                               "groups": [{ "groupid": WHATS_UP_GROUP_ID.to_s }],
                               "templates": [{ "templateid": ICMP_PING_TEMPLATE_ID.to_s }])
      return { success: "false", error: "bad params" } unless response

      device.zbx_id = response['hostids'].first.to_i
      return { success: "true" } if device.save!

      { success: "false", error: "could not save device" }
    end

    def remove(device)
      response =
        request("host.delete", [device.zbx_id.to_s])
      return { success: "false", error: "bad params" } unless response

      device.zbx_id = nil
      return { success: "true" } if device.save!

      { success: "false", error: "could not save device" }
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
