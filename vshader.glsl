
attribute vec4 vertexPos;
uniform vec4 u_Translation;

void main()
{
    gl_PointSize = 2.0;

    gl_Position = vertexPos + u_Translation;

}


