package uk.bizel.czi.webservice;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * Servlet implementation class ErrorHandler
 */
@WebServlet("/AppExceptionHandler")
public class ErrorHandler extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public ErrorHandler() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// headers already set?

		if (request.getAttribute("javax.servlet.error.exception_type").toString().contains("bisel")) {
			response.setStatus(200);
		}
		PrintWriter out = response.getWriter();
		Error error = new Error("fail", request.getAttribute("javax.servlet.error.message").toString(),
				request.getAttribute("javax.servlet.error.exception_type").toString(),
				request.getAttribute("javax.servlet.forward.request_uri").toString());
		Gson gson = new GsonBuilder().create();
		out.println(gson.toJson(error));

		out.flush();
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}