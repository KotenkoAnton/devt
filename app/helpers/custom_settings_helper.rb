module CustomSettingsHelper
  def class_for(element)
    case element
    when "body_navbar"
      session["minimize_navbar"] ? "mini-navbar" : ""
    end
  end
end
